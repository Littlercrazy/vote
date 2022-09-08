import { AdminLoginDto, CreateElecionDto, CretaeCandidateDto, ElecionStausDto } from '@dto/index';
import { PageParamQuery } from '@dto/page-param.dto';
import { Candidate } from '@entity/candidate.entity';
import { Election } from '@entity/election.entity';
import { ErrorCode, SuccessCode } from '@enums/api-code.enum';
import { ElectionStatusEnum } from '@enums/entity.enum';
import { ApiException } from '@exception/ApiException';
import { BaseResponse } from '@exception/BaseResponse';
import { LoginGuard } from '@guard/login.guard';
import { Body, Get, Inject, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { AdminService } from '@service/admin.service';
import { CandidateService } from '@service/candidate.service';
import { ElectionService } from '@service/election.service';
import { VoteService } from '@service/vote.service';
import { CONFIG } from '@utils/config.util';
import { CookieUtil } from '@utils/cookie.util';
import { DateUtil } from '@utils/date.util';
import { RedisUtil } from '@utils/redis.util';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ActionResponse, AdminResponse, AdminVO, CandidateListResponse, VoteListAndCountResponse } from '@interfaces/admin.interface';

@ApiTags('管理员模块')
@Controller('admin')
export class AdminController {

    @Inject()
    private readonly adminService: AdminService;

    @Inject()
    private readonly electionService: ElectionService;

    @Inject()
    private readonly candidateService: CandidateService;

    @Inject()
    private readonly voteService: VoteService;

    /**
     * 管理员登录
     * @param body 
     * @returns 
     */
    @Post('/login')
    @ApiOkResponse({
        description: '登录用户信息',
        type: AdminResponse
    })
    async login(@Body() body: AdminLoginDto,  @Req() req: Request, @Res() res: Response): Promise<AdminVO> {
        const u = await this.adminService.getAdminByAccount(body.account);
        if(u?.id) {
            if (crypto.createHash('md5').update(body.password).digest('hex') === u.password) {
                // 写cookie
                const token = CookieUtil.getToken();
                CookieUtil.setCookie(req, res, token);
                // token写入redis
                await RedisUtil.setNoError(`token:${token}`, JSON.stringify(u), CONFIG.COOKIE_MAX_AGE);
                // 需要特殊处理
                const baseResponse: BaseResponse = {
                    code: SuccessCode.SUCCESS,
                    data: u
                };
                return res.status(SuccessCode.HTTP_OK).json(baseResponse);
            } else {
                throw new ApiException(ErrorCode.USER_PWD_ERROR);
            }
        } else {
            throw new ApiException(ErrorCode.USER_NOT_EXISTS);
        }
    }

    /**
     * 管理员创建活动
     * @param param
     */
    @Post('/election/add')
    @ApiHeader({
        name: 'USER_TOKEN',
        required: true,
        description: '用户token'
    })
    @ApiOkResponse({
        description: '管理员创建活动',
        type: ActionResponse
    })
    @UseGuards(LoginGuard)
    async createElection(@Body() body: CreateElecionDto): Promise<any> {
        // 创建活动默认是未开启的
        const election = new Election({
            name: body.name,
            description: body.description,
            status: 0,
            createTime: DateUtil.now(),
            updateTime: DateUtil.now()
        });
        await this.adminService.save(election);
        return {
            flag: true
        };
    }

    /**
     * 管理员开启/结束活动
     * @param param
     */
    @Post('/election/edit/:id')
    @ApiHeader({
        name: 'USER_TOKEN',
        required: true,
        description: '用户token'
    })
    @ApiOkResponse({
        description: '管理员开启/结束活动',
        type: ActionResponse
    })
    @UseGuards(LoginGuard)
    async editElection(@Param('id') id: number, @Body() body: ElecionStausDto): Promise<any> {
        const election = await this.electionService.getElectionById(id);
        if (election?.id) {
            if (election.status >= body.status) {
                 // 状态只能从0->1->2
                 throw new ApiException(ErrorCode.PARAM_ERROR);
            }
            if (body.status === ElectionStatusEnum.RUNNING) {
                // 开启选举 需要候选人数据
                const list = await this.candidateService.getlistByElectionId(election.id);
                if (list?.length < 2) {
                    // 候选人不能少于2
                    throw new ApiException(ErrorCode.PARAM_ERROR);
                }
            }
            await this.electionService.updateStatusById(election.id, body.status);
            // 结束 邮箱通知结果
            if (body.status === ElectionStatusEnum.ENDED) {
                this.sendEmailResult(election.id);
            }
        } else {
            // 数据不存在
            throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        return {
            flag: true
        };
    }

    /**
     * 管理员添加选举候选人
     * @param param
     */
    @Post('/candidate/add/:electionId')
    @ApiHeader({
        name: 'USER_TOKEN',
        required: true,
        description: '用户token'
    })
    @ApiOkResponse({
        description: '管理员添加选举候选人',
        type: ActionResponse
    })
    @UseGuards(LoginGuard)
    async addCandidate(@Param('electionId') electionId: number, @Body() body: CretaeCandidateDto): Promise<any> {
        const election = await this.electionService.getElectionById(electionId);
        if (election?.status > ElectionStatusEnum.CREATED) {
            // 已经开始选举 无法添加
            throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        const result = await this.candidateService.getByElectionAndIdCard(electionId, body.idCard);
        if(result?.id) {
            // 候选人已经存在
            throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        const candidate = new Candidate({
            name: body.name,
            idCard: body.idCard,
            result: 0,
            createTime: DateUtil.now(),
            updateTime: DateUtil.now()
        });
        await this.adminService.save(candidate);
        return {
            flag: true
        };
    }

    /**
     * 管理员查询选举活动候选人列表
     * @param param
     */
     @Get('/candidate/list/:electionId')
     @ApiHeader({
        name: 'USER_TOKEN',
        required: true,
        description: '用户token'
    })
    @ApiOkResponse({
        description: '管理员查询选举活动候选人列表',
        type: CandidateListResponse
    })
     @UseGuards(LoginGuard)
     async getCandidateListByElection(@Param('electionId') electionId: number): Promise<Candidate[]> {
        return await this.candidateService.getlistByElectionId(electionId);
     }

    /**
     * 管理员查询选举活动候选人得票记录和总数
     * @param param
     */
    @Get('/candidate/vote/list/:canditionId')
    @ApiHeader({
        name: 'USER_TOKEN',
        required: true,
        description: '用户token'
    })
    @ApiOkResponse({
        description: '管理员查询选举活动候选人列表',
        type: VoteListAndCountResponse
    })
    @UseGuards(LoginGuard)
    async getVoteListByCandidate(@Param('canditionId') canditionId: number, @Query() query: PageParamQuery): Promise<any> {
        return await this.voteService.getListAndCountById(canditionId, query.pageIndex, query.pageIndex, query.lastId);
    }

    private async sendEmailResult(electionId: number): Promise<any> {
        const maxVote = { candidate : null, count : 0 };
        const candidateIds = [];
        const list = await this.candidateService.getlistByElectionId(electionId);
        for (const item of list) {
            candidateIds.push(item.id);
            const count = await this.voteService.getTotalCountById(item.id);
            if (count > maxVote.count) {
                maxVote.candidate = item,
                maxVote.count = count
            }
        }
        // 更新结果
        await this.candidateService.updateResultById(maxVote.candidate.id, 1);
        // 投票记录 如果数据太多就可以分页
        const voteList = await this.voteService.getAllList(candidateIds);
        for(const vote of voteList) {
            // todo 对接第三方邮箱 发送邮件
            console.log(vote);
        }
    }
}
