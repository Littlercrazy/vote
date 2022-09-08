/**
 * Created by Alex on 2019-10-11.
 */

'use strict';
import {BaseService} from '@service/base.service';
import {
    BaseEntity,
    EntityManager,
    FindConditions,
    FindManyOptions,
    FindOneOptions,
    InsertResult,
    ObjectID, Repository, SelectQueryBuilder,
    DeepPartial
} from 'typeorm';

export class BaseOrmService<Entity = BaseEntity> extends BaseService {
    private readonly repository: Repository<Entity>;

    constructor(repository: Repository<Entity>) {
        super();
        this.repository = repository;
    }

    async getById(id?: string | number | Date | ObjectID, options?: FindOneOptions<Entity>) {
        return await this.repository.findOne(id);
    }

    async count(entity: Entity) {
        return await this.repository.count(entity);
    }

    async insert(entity: Entity): Promise<InsertResult> {
        return await this.repository.insert(entity);
    }

    async create(entity: DeepPartial<Entity>): Promise<Entity> {
        return await this.repository.create(entity);
    }

    async save(entity: DeepPartial<Entity>): Promise<DeepPartial<Entity>> {
        return await this.repository.save(entity);
    }

    async remove(entity: Entity): Promise<Entity> {
        return await this.repository.remove(entity);
    }

    async all() {
        return await this.repository.find();
    }

    async find(conditions?: FindConditions<Entity>): Promise<Entity[]> {
        return await this.repository.find(conditions);
    }

    async findAndCount(conditions?: FindConditions<Entity>): Promise<[Entity[], number]> {
        return await this.repository.findAndCount(conditions);
    }

    async findMany(options?: FindManyOptions<Entity>): Promise<Entity[]> {
        return await this.repository.find();
    }

    async findOne(conditions?: FindConditions<Entity>, options?: FindOneOptions<Entity>) {
        return await this.repository.findOne(conditions, options);
    }

    async saveByTransaction(manager: EntityManager, entity: Entity): Promise<Entity> {
        return await manager.save<Entity>(entity);
    }

    async removeByTransaction(manager: EntityManager, entity: Entity): Promise<Entity> {
        return await manager.remove<Entity>(entity);
    }

    queryBuilder(): SelectQueryBuilder<Entity> {
        return this.repository.createQueryBuilder();
    }

    async rawQuery(sql: string, params?: any[]): Promise<any> {
        return await this.repository.query(sql, params);
    }
}
