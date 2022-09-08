import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PageParamQuery {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    @ApiProperty({
        description: '第几页',
        required: false
    })    
    pageIndex: number = 1;

    @Type(() => Number)
    @IsInt()
    @Max(20)
    @IsOptional()
    @ApiProperty({
        description: '每页数据条数',
        required: false
    })  
    pageSize: number = 10;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @ApiProperty({
        description: '上次最小id',
        required: false
    })  
    lastId: number = 0;
}
