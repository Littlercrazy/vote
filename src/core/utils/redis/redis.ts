import * as assert from 'assert';
import { createClient, RedisClient } from 'redis';
import {
    genRedisCacheKey,
    LibRedisException,
    ConvertRedisErrorCatch
} from './util';

// export interface LibRedisConfig extends ClientOpts {}
export interface LibRedisConfig {
    keyPrefix?: string;
    host?: string;
    port?: number;
    password?: string;
    db?: string | number;
}

export class LibRedis {
    /**
     * 暂存redis连接，相同配置会返回相同的redis实例
     */
    private static _redisCacheMap: {
        [K: string]: {
            instance: RedisClient;
            create: number;
        };
    } = {};

    /**
     * 缓存连接的最大数量限制
     */
    private static _maxCacheLimit: number = 3;

    /**
     * 获取缓存的redis限制
     */
    public static get MaxCacheLimit() {
        return this._maxCacheLimit;
    }

    /**
     * 设置缓存的redis限制数，设为0表示禁用缓存，每次new的都是新的
     */
    public static set MaxCacheLimit(val: number) {
        assert(!isNaN(val), new LibRedisException('val must be number'));
        assert(Number(val) >= 0, new LibRedisException('val must >= 0'));
        this._maxCacheLimit = ~~val;

        // 移除超出的缓存
        let keys = Object.keys(this._redisCacheMap);
        if (keys.length > this._maxCacheLimit) {
            let needClear = keys
                .map(k => {
                    return {
                        key: k,
                        create: this._redisCacheMap[k].create
                    };
                })
                .sort((a, b) => a.create - b.create)
                .slice(0, keys.length - this._maxCacheLimit);

            needClear.forEach(({ key }) => {
                this.removeCache(key);
            });
        }
    }

    /**
     * 检查对应的key值是否已经有缓存
     * @param key
     */
    public static hasCacheKey(key: string) {
        return !!this._redisCacheMap[key];
    }

    /**
     * 把redis实例添加到缓存，如果超出限制，最早创建的会被删除
     * @param key
     * @param redis
     */
    public static addCache(key: string, redis: RedisClient) {
        let keys = Object.keys(this._redisCacheMap);
        if (keys.length >= this.MaxCacheLimit) {
            let first = keys
                .map(k => {
                    return {
                        key: k,
                        create: this._redisCacheMap[k].create
                    };
                })
                .sort((a, b) => a.create - b.create)[0].key;
            this.removeCache(first);
        }

        this._redisCacheMap[key] = {
            instance: redis,
            create: Date.now()
        };
    }

    /**
     * 移除缓存的redis连接
     * @param key
     */
    public static removeCache(key: string) {
        if (this.hasCacheKey(key)) {
            // 只需要移出缓存，不需要关闭连接
            // this._redisCacheMap[key].instance.removeAllListeners();
            // this._redisCacheMap[key].instance.quit();
            this._redisCacheMap[key] = null;
            delete this._redisCacheMap[key];
        }
    }

    /**
     * 获取缓存的redis实例
     * @param key
     */
    public static getCache(key: string) {
        if (this.hasCacheKey(key)) {
            // 更新时间
            this._redisCacheMap[key].create = Date.now();
            return this._redisCacheMap[key].instance;
        }
        return null;
    }

    private _redis: RedisClient = null;
    constructor(config: LibRedisConfig = {}) {
        const { keyPrefix, host, port, password, db } = config;

        const key = genRedisCacheKey({ keyPrefix, host, port, password, db });

        if (LibRedis.hasCacheKey(key) && LibRedis.MaxCacheLimit > 0) {
            this._redis = LibRedis.getCache(key);
        } else {
            this._redis = createClient({
                prefix: keyPrefix,
                host,
                port,
                password,
                db
            });

            this._redis.on('connect', () => {
                const str = `[lib-redis] server connecting redis:// ${
                    config.host ? config.host : '127.0.0.1'
                    }:${config.port ? config.port : 6379} ${
                    config.db ? config.db : 0
                    }`;
                console.log(str);
            });
            this._redis.on('error', err => {
                const str = `[lib-redis] server redis:// ${
                    config.host ? config.host : '127.0.0.1'
                    }:${config.port ? config.port : 6379} ${
                    config.db ? config.db : 0
                    } error: ${err}`;
                console.log(str);
            });

            if (LibRedis.MaxCacheLimit > 0) {
                LibRedis.addCache(key, this._redis);
            }
        }
    }

    /**
     * 释放
     */
    @ConvertRedisErrorCatch()
    public dispose() {
        assert(this._redis, `[lib-redis] redis is not found`);
        this._redis.removeAllListeners();
        this._redis.quit();
        this._redis = null;
    }

    /**
     * 获取原始redis实例
     * @return 返回redis client
     */
    @ConvertRedisErrorCatch({
        throwError: true
    })
    public getOriginInstance(): RedisClient {
        assert(this._redis, `[lib-redis] redis is not found`);
        return this._redis;
    }

    /**
     * 私有的获取值的方法
     * @param key
     */
    private _get(key: string): Promise<string> {
        assert(this._redis, `[lib-redis] redis is not found`);
        return new Promise((resolve, reject) => {
            this._redis.get(key, function (err, reply) {
                if (err) return reject(err);
                return resolve(reply);
            });
        });
    }

    /**
     * 私有的获取ttl的方法
     * @param key
     */
    private _ttl(key: string): Promise<number> {
        assert(this._redis, `[lib-redis] redis is not found`);
        return new Promise((resolve, reject) => {
            this._redis.ttl(key, function (err, reply) {
                if (err) return reject(err);
                return resolve(reply);
            });
        });
    }

    /**
     * 私有的设置值的方法
     * @param key
     * @param value
     * @param expire -1表示永不过期，单位毫秒
     */
    private _set(
        key: string,
        value: any,
        expire: number = 1000 * 60 * 30
    ): Promise<string> {
        assert(this._redis, `[lib-redis] redis is not found`);
        return new Promise((resolve, reject) => {
            if (expire === -1) {
                return this._redis.set(key, value, function (err, reply) {
                    if (err) return reject(err);
                    return resolve(reply);
                });
            }

            // px表示毫秒 expiry 默认时间30分钟
            return this._redis.set(key, value, 'PX', expire, function (err, reply) {
                if (err) return reject(err);
                return resolve(reply);
            });
        });
    }

    /**
     * 私有的设置值方法(key永久不过期)
     * @param key
     * @param value
     * @private
     */
    private _setPersist(
        key: string,
        value: any
    ): Promise<string> {
        assert(this._redis, `[lib-redis] redis is not found`);
        return new Promise((resolve, reject) => {
            // px表示毫秒 expiry 默认时间30分钟
            this._redis.set(key, value, function (err, reply) {
                if (err) return reject(err);
                return resolve(reply);
            });
        });
    }

    /**
     * 获取key对应的value，会抛出异常
     * @param {string} key redis key
     * @return 返回 promise
     */
    @ConvertRedisErrorCatch({
        throwError: true,
        async: true
    })
    public async get(key: string): Promise<string> {
        return await this._get(key);
    }

    /**
     * 获取key对应的value，自带错误处理，不会上抛异常
     * @param key
     */
    @ConvertRedisErrorCatch({
        async: true
    })
    public async getNoError(key: string): Promise<string> {
        return await this._get(key);
    }

    /**
     * 获取key对应的value转json对象，自带错误处理，不会上抛异常
     * @param key
     */
    @ConvertRedisErrorCatch({
        async: true
    })
    public async getJSONNoError<T = Object>(key: string): Promise<T> {
        const result = await this._get(key);
        return JSON.parse(result) as T;
    }

    /**
     * 获取key对应的过期时间
     * -2：表示没有找到
     * -1：表示永不过期
     * 20：具体数字表示过期秒数
     * @param key 
     */
    @ConvertRedisErrorCatch({
        throwError: true,
        async: true
    })
    public async getTtl(key: string): Promise<Number> {
        const result = await this._ttl(key);
        return result;
    }

    /**
     * 获取key对应的过期时间，自带错误处理，不会上抛异常
     * -2：表示没有找到
     * -1：表示永不过期
     * 20：具体数字表示过期秒数
     * null: 表示不存在，报错了
     * @param key
     */
    @ConvertRedisErrorCatch({
        async: true
    })
    public async getTtlNoError(key: string): Promise<Number> {
        const result = await this._ttl(key);
        return result;
    }

    /**
     * 设置redis value，会上抛异常
     * @param {string} key redis key
     * @param {*} value redis value
     * @param {number} expire 过期时间，默认30分钟，单位：毫秒  -1表示永不过期
     * @return 返回 promise
     */
    @ConvertRedisErrorCatch({
        throwError: true,
        async: true
    })
    public async set(
        key: string,
        value: any,
        expire: number = 1000 * 60 * 30
    ): Promise<string> {
        return await this._set(key, value, expire);
    }

    /**
     * 设置redis value，自带错误处理，不会上抛异常
     * @param {string} key redis key
     * @param {*} value redis value
     * @param {number} expire 过期时间，默认30分钟，单位：毫秒  -1表示永不过期
     * @return 返回 promise
     */
    @ConvertRedisErrorCatch({
        async: true
    })
    public async setNoError(
        key: string,
        value: any,
        expire: number = 1000 * 60 * 30
    ): Promise<string> {
        return await this._set(key, value, expire);
    }

    /**
     * 私有的删除键值的方法
     * @param key 键值，可以为string或者string数组
     * @returns promise包装的成功删除的数量
     */
    private _del(key: string | string[]): Promise<number> {
        return new Promise((resolve, reject) => {
            this._redis.del(key, function (err, reply) {
                if (err) return reject(err);
                return resolve(reply);
            });
        });
    }

    /**
     * 删除redis key，会上抛异常
     * @param {string | string[]} key redis key
     * @returns promise包装的成功删除的数量
     */
    @ConvertRedisErrorCatch({
        throwError: true,
        async: true
    })
    public async del(key: string | string[]): Promise<number> {
        return await this._del(key);
    }

    /**
     * 删除redis key，自带错误处理，不会上抛异常
     * @param {string | string[]} key redis key
     * @returns promise包装的成功删除的数量
     */
    @ConvertRedisErrorCatch({
        async: true
    })
    public async delNoError(key: string | string[]): Promise<number> {
        return await this._del(key);
    }

    /**
     * 设置值方法(key永久不过期)
     * @param key
     * @param value
     */
    @ConvertRedisErrorCatch({
        throwError: true,
        async: true
    })
    public async setPersist(
        key: string,
        value: any,
    ): Promise<string> {
        return this._setPersist(key, value);
    }

    /**
     * 重命名 key，会上抛异常
     * @param {string} oldKey redis key
     * @param {string} newKey 修改后的 redis key
     * @returns promise包装的是否执行成功
     */
    @ConvertRedisErrorCatch({
        throwError: true,
        async: true
    })
    public async rename(oldKey: string , newKey: string): Promise<any> {
        return await this._rename(oldKey, newKey);
    }

    /**
     * 重命名 key，自带错误处理，不会上抛异常
     * @param {string} oldKey redis key
     * @param {string} newKey 修改后的 redis key
     * @returns promise包装的是否执行成功
     */
    @ConvertRedisErrorCatch({
        async: true
    })
    public async renameNoError(oldKey: string , newKey: string): Promise<any> {
        return await this._rename(oldKey, newKey);
    }

    /**
     * 私有的重命名 key
     * @param {string} oldKey redis key
     * @param {string} newKey 修改后的 redis key
     * @returns promise包装的是否执行成功
     */
    private _rename(oldKey: string , newKey: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._redis.rename(oldKey, newKey, function(err, reply) {
                if (err) return reject(err);
                return resolve(reply);
            });
        });
    }
}
