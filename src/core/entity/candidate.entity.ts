import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("election_candidate_key", ["electionId", "idCard"], { unique: true })
@Entity("candidate", { schema: "vote" })
export class Candidate extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "Primary Key" })
  id: number;

  @Column("int", { name: "election_id", comment: "候选人参与的选举活动id" })
  electionId: number;

  @Column("varchar", { name: "name", comment: "候选人姓名", length: 64 })
  name: string;

  @Column("varchar", {
    name: "id_card",
    comment: "候选人身份证 唯一标识",
    length: 64,
  })
  idCard: string;

  @Column("tinyint", {
    name: "result",
    comment: "参选结果0-落选 1-中选",
    default: () => "'0'",
  })
  result: number;

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

  constructor(init?: Partial<Candidate>) {
    super();
    Object.assign(this, init);
  }
}
