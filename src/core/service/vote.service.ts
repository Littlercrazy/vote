/**
 * Created by Alex on 2019-10-17.
 */

'use strict';
import { Vote } from '@entity/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseOrmService } from '@service/base-orm.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class VoteService extends BaseOrmService<Vote> {
    constructor(
        @InjectRepository(Vote)
        private readonly voteRepository: Repository<Vote>
    ) {
        super(voteRepository);
    }

    /**
     * 查询投票用户列表
     */
    async getListAndCountById(candidateId: number, pageIndex, pageSize, lastId: number): Promise<{items: Vote[], total: number}> {
        const queryBuilder = this.voteRepository
            .createQueryBuilder()
            .select('id, email, createTime')
            .where('candidateId = :candidateId', { candidateId })
            .skip((pageIndex - 1) * pageSize)
            .take(pageSize)
            .orderBy('id', 'DESC');
        if (lastId> 0) {
            queryBuilder.andWhere('id < :lastId', { lastId });
        }

        const [items, total] = await Promise.all([queryBuilder.getRawMany(), queryBuilder.getCount()]);
        return { items, total };
    }

    /**
     * 查询投票用户总数
     * @param account 用户名
     */
     async getTotalCountById(candidateId: number): Promise<number> {
        const queryBuilder = this.voteRepository
            .createQueryBuilder()
            .select('id')
            .where('candidateId = :candidateId', { candidateId })
        const total = await  queryBuilder.getCount();
        return total;
    }

    /**
     * 查询所有投票记录
     */
     async getAllList(candidateIds: number[]): Promise<Vote[]> {
        const result = await this.voteRepository.find(
            {
                select: ['email', 'idCard'],
                where: {
                    candidateId: In(candidateIds)
                }
            },
        )
        return result;
    }
}
