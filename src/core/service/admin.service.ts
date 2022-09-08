/**
 * Created by Alex on 2019-10-17.
 */

'use strict';
import { Admin } from '@entity/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseOrmService } from '@service/base-orm.service';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService extends BaseOrmService<Admin> {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>
    ) {
        super(adminRepository);
    }
    /**
     * 根据账号查询用户
     * @param account 用户名
     */
    async getAdminByAccount(account: string): Promise<Admin> {
        return await this.adminRepository.findOne({ account });
    }
}
