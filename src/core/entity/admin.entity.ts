import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("admin", { schema: "vote" })
export class Admin extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "Primary Key" })
  id: number;

  @Column("varchar", { name: "account", comment: "管理员账户", length: 64 })
  account: string;

  @Column("varchar", { name: "password", comment: "管理员密码", length: 64 })
  password: string;

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

  constructor(init?: Partial<Admin>) {
    super();
    Object.assign(this, init);
  }
}
