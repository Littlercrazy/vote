import { ApiProperty } from "@nestjs/swagger";


export class CommonResponse {
    @ApiProperty({ description: '状态码', example: 0 })
    code: number
  
    @ApiProperty({ description: '请求结果信息', example: '请求成功' })
    message: string
}

export class AdminVO {
  @ApiProperty({ description: 'id', example: 1 })
  id: number;

  @ApiProperty({ description: '创建时间', example: 1662617528 }) 
  createTime: number

  @ApiProperty({ description: '更新时间', example: 1662617528 }) 
  updateTime: number

  @ApiProperty({ description: '账号', example: '管理员账号' }) 
  account: string;
}

export class ActionVO {
    @ApiProperty({ description: '操作结果', example: true })
    flag: boolean
}

export class CandidateVO {
    @ApiProperty({ description: 'id', example: 1 })
    id: number;
  
    @ApiProperty({ description: '候选人参与的选举活动id', example: 1 }) 
    electionId: number
  
    @ApiProperty({ description: '候选人姓名', example: '张三' }) 
    name: string
  
    @ApiProperty({ description: '候选人身份证', example: 'A234567(8)' }) 
    idCard: string;

    @ApiProperty({ description: '参选结果0-落选 1-中选', example: 1 }) 
    result: number
}

export class VoteVO {
    @ApiProperty({ description: 'id', example: 1 })
    id: number;
  
    @ApiProperty({ description: '投票的候选人id', example: 1 }) 
    candidateId: number
  
    @ApiProperty({ description: '投票人邮箱', example: 'etst@hjeh.com' }) 
    email: string
  
    @ApiProperty({ description: '投票人身份证', example: 'A234567(8)' }) 
    idCard: string;

    @ApiProperty({ description: '投票时间', example: 1662617528 }) 
    createTime: number
}

export class VoteListAndCountVO {
    @ApiProperty({ type: VoteVO, isArray: true })
    items: Array<VoteVO>

    @ApiProperty({ description: '候选人总票数', example: '123' }) 
    total: number;
}
  

export class AdminResponse extends CommonResponse {

    @ApiProperty({ description: '数据',
      type: () => AdminVO })
    data: AdminVO

}

export class ActionResponse  extends CommonResponse {
    @ApiProperty({ description: '操作结果',
      type: () => ActionVO })
    data: ActionVO
}

export class CandidateListResponse  extends CommonResponse {
    @ApiProperty({ type: CandidateVO, isArray: true })
        data: Array<CandidateVO>
}

export class VoteListAndCountResponse extends CommonResponse {
    @ApiProperty({ type: VoteListAndCountVO, isArray: true })
        data: Array<VoteListAndCountVO>
}

// export class ArticleListVO {
//     @ApiProperty({ type: SimpleInfo, isArray: true })
//     list: Array<SimpleInfo>
  
//     @ApiProperty({ type: () => Pagination })
//     pagination: Pagination
// }
