import { Candidate } from '@entity/candidate.entity';
import { Election } from '@entity/election.entity';
import { Vote } from '@entity/vote.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateService } from '@service/candidate.service';
import { ElectionService } from '@service/election.service';
import { VoteService } from '@service/vote.service';
import { VoteController } from './vote.controller';

@Module({
    controllers: [VoteController],
    imports: [TypeOrmModule.forFeature([Election, Candidate, Vote])],
    providers: [ElectionService, CandidateService, VoteService]
})

export class VoteModule { }
