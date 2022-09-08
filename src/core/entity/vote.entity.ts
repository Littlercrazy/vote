import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("id_card_key", ["idCard"], { unique: true })
@Entity("vote", { schema: "vote" })
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "Primary Key" })
  id: number;

  @Column("varchar", { name: "email", comment: "投票人邮箱", length: 64 })
  email: string;

  @Column("varchar", {
    name: "id_card",
    unique: true,
    comment: "投票人身份证 唯一标识",
    length: 64,
  })
  idCard: string;

  @Column("tinyint", { name: "candidate_id", comment: "投票的候选人id" })
  candidateId: number;

  @Column("int", {
    name: "create_time",
    comment: "创建时间",
    default: () => "'0'",
  })
  createTime: number;

  @Column("int", {
    name: "update_time",
    comment: "更新时间",
    default: () => "'0'",
  })
  updateTime: number;

  constructor(init?: Partial<Vote>) {
    super();
    Object.assign(this, init);
  }
}
