import { VoteDto } from '@dto/index';
import { PageParamQuery } from '@dto/page-param.dto';
import { Vote } from '@entity/vote.entity';
import { ErrorCode } from '@enums/api-code.enum';
import { ElectionStatusEnum } from '@enums/entity.enum';
import { ApiException } from '@exception/ApiException';
import { ActionResponse, VoteListAndCountResponse } from '@interfaces/admin.interface';
import { Body, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CandidateService } from '@service/candidate.service';
import { ElectionService } from '@service/election.service';
import { VoteService } from '@service/vote.service';
import { DateUtil } from '@utils/date.util';

@ApiTags('用户投票模块')
@Controller('vote')
export class VoteController {

    @Inject()
    private readonly voteService: VoteService;

    @Inject()
    private readonly electionService: ElectionService;

    @Inject()
    private readonly candidateService: CandidateService;
    
    /**
     * 投票
     * @param body 
     * @returns 
     */
    @Post('/add')
    @ApiOkResponse({
        description: '管理员添加选举候选人',
        type: ActionResponse
    })
    async vote(@Body() body: VoteDto): Promise<any> {
        const { email, idCard, candidateId } = body;
        const candidate = await this.candidateService.findOne({id: candidateId});
        if(!candidate?.id) {
             // 候选人不存在
             throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        const election = await this.electionService.findOne({id: candidate.electionId, status: ElectionStatusEnum.RUNNING});
        if (!election?.id) {
            // 没有进行中的选举活动
            throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        const emailPatt = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        const idCardPatt = /^[A-Z]{1}[0-9]{6}\([0-9]{1}\)$/;
        if (!emailPatt.test(email)) {
            // 邮箱格式错误
            throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        if (!idCardPatt.test(idCard)) {
            // 身份证格式错误
            throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        const vote = await this.voteService.findOne({idCard});
        if (vote?.id) {
            // 该身份证已经投过票
            throw new ApiException(ErrorCode.PARAM_ERROR);
        }
        const model = new Vote({
            email,
            idCard,
            candidateId,
            createTime: DateUtil.now(),
            updateTime: DateUtil.now()
        })
        await this.voteService.save(model);
        return {
            flag: true
        }
    }

    /**
     * 获取投票实时状态
     * @param id 
     * @returns 
     */
    @Get('/data/candidate/:id')
    @ApiOkResponse({
        description: '管理员查询选举活动候选人列表',
        type: VoteListAndCountResponse
    })
    async getCandidateData(@Param('id') id: number, @Query() query: PageParamQuery): Promise<any> {
        return await this.voteService.getListAndCountById(id, query.pageIndex, query.pageSize, query.lastId);
    }
}
