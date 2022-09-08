/**
 * Created by Alex on 2019-10-17.
 */

'use strict';
import { Election } from '@entity/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseOrmService } from '@service/base-orm.service';
import { DateUtil } from '@utils/date.util';
import { Repository } from 'typeorm';

@Injectable()
export class ElectionService extends BaseOrmService<Election> {
    constructor(
        @InjectRepository(Election)
        private readonly electionRepository: Repository<Election>
    ) {
        super(electionRepository);
    }
    
    /**
     * 根据id查询纪录
     * @param id 数据库id
     */
    async getElectionById(id: number): Promise<Election> {
        return await this.electionRepository.findOne({ id });
    }

    /**
     * 更新状态
     * @param staus
     */
    async updateStatusById(id: number, status: number): Promise<any> {
        return await this.electionRepository.update({ id }, {status, updateTime: DateUtil.now()});
    }
}
