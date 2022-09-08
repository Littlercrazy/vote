/**
 * Created by Alex on 2019-10-17.
 */

'use strict';
import { Candidate } from '@entity/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseOrmService } from '@service/base-orm.service';
import { DateUtil } from '@utils/date.util';
import { Repository } from 'typeorm';

@Injectable()
export class CandidateService extends BaseOrmService<Candidate> {
    constructor(
        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>
    ) {
        super(candidateRepository);
    }

    /**
     * 根据electionid获取候选人列表
     * @param electionId
     */
    async getlistByElectionId(electionId: number): Promise<Candidate[]> {
        return await this.candidateRepository.find({ electionId });
    }

    /**
     * 根据electionid和idcard获取候选人
     * @param electionId
     */
    async getByElectionAndIdCard(electionId: number, idCard: string): Promise<Candidate> {
        return await this.candidateRepository.findOne({ electionId, idCard });
    }

    /**
     * 更新选举结果
     * @param result
     */
    async updateResultById(id: number, result: number): Promise<any> {
        return await this.candidateRepository.update({ id }, {result, updateTime: DateUtil.now()});
    }
}
