import { ElectionStatusEnum } from '@enums/entity.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiProperty} from '@nestjs/swagger';
export class AdminLoginDto {
    /**
     * 用户名
     */
    @IsString()
    @ApiProperty({
        description: '用户名'
    })
    account: string;

    /**
     * 密码
     */
    @IsString()
    @ApiProperty({
        description: '密码'
    })
    password: string;
}

export class ElecionStausDto {
    /**
     * 开启状态
     */
    @Type(() => Number)
    @IsNumber()
    @IsEnum(ElectionStatusEnum)
    @ApiProperty({
        description: '开启状态'
    })
    status: number = ElectionStatusEnum.CREATED
}


export class CreateElecionDto extends ElecionStausDto{
    /**
     * 名称
     */
    @IsString()
    @ApiProperty({
        description: '名称'
    })
    name: string;

    /**
     * 描述
     */
    @IsString()
    @ApiProperty({
        description: '描述'
    })
    description: string;
}

export class CretaeCandidateDto {
    /**
     * 名称
     */
    @IsString()
    @ApiProperty({
        description: '名称'
    })
    name: string;

    /**
     * 身份证
     */
    @IsString()
    @ApiProperty({
        description: '身份证'
    })
    idCard: string;
}

export class VoteDto {
    /**
     * 邮箱
     */
    @IsString()
    @ApiProperty({
        description: '邮箱'
    })
    email: string;

    /**
     * 身份证
     */
    @IsString()
    @ApiProperty({
        description: '身份证'
    })
    idCard: string;

    /**
     * 候选人id
     */
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({
        description: '候选人id'
    })
    candidateId: number;
}