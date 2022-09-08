import { AdminModule } from '@modules/admin/admin.module';
import { VoteModule } from '@modules/vote/vote.module';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {CONFIG} from '@utils/config.util';
import { join } from 'path';

@Global()
@Module({
    imports: [
        AdminModule,
        VoteModule,
        TypeOrmModule.forRoot({
            // @ts-ignore
            type: CONFIG.db.temp.type,
            host: CONFIG.db.temp.host,
            port: CONFIG.db.temp.port,
            username: CONFIG.db.temp.user,
            password: CONFIG.db.temp.password,
            database: CONFIG.db.temp.database,
            entities: [join(__dirname, '../core/entity/*.entity{.ts,.js}')],
            synchronize: false
        })
    ]
})
export class ApplicationModule {
}
