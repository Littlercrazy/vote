import { Admin, Candidate, Election, Vote } from '@entity/index';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from '@service/admin.service';
import { CandidateService } from '@service/candidate.service';
import { ElectionService } from '@service/election.service';
import { VoteService } from '@service/vote.service';
import { AdminController } from './admin.controller';

@Module({
    controllers: [AdminController],
    imports: [TypeOrmModule.forFeature([Admin, Election, Candidate, Vote])],
    providers: [AdminService, ElectionService, CandidateService, VoteService]
})

export class AdminModule { }
