import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("election", { schema: "vote" })
export class Election extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "Primary Key" })
  id: number;

  @Column("varchar", { name: "name", comment: "选举名称", length: 64 })
  name: string;

  @Column("varchar", { name: "description", comment: "选举描述", length: 255 })
  description: string;

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

  @Column("tinyint", {
    name: "status",
    comment: "选举状态 0-未开始 1-进行中 2-已结束",
    default: () => "'0'",
  })
  status: number;

  constructor(init?: Partial<Election>) {
    super();
    Object.assign(this, init);
  }
}
