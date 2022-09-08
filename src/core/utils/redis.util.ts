import { LibRedis } from './redis/index';
import { CONFIG } from '@utils/config.util';
const redis = new LibRedis(CONFIG.redis.temp);

export class RedisUtil {
    /**
     * @description 获取redis键值
     * @param key 键
     * @returns 值
     */
    static async get(key: string): Promise<string> {
        const r = await redis.get(key);
        return r;
    }

    /**
     * 获取redis原始对象
     */
    static getOriginInstance(): Promise<any> {
        return redis.getOriginInstance();
    }

    /**
     * @description 设置redis键值
     * @param key 键
     * @param value 值
     * @param exp 过期时间(ms)
     * @returns void
     */
    static async set(key: string, value: string, exp: number): Promise<any> {
        return await redis.set(key, value, exp);
    }

    /**
     * @description 获取redis键值 无错误版本
     * @param key 键
     * @returns 值
     */
    static async getNoError(key: string): Promise<string> {
        const r = await redis.getNoError(key);
        return r;
    }

    /**
     * @description 设置redis键值 无错误版本
     * @param key 键
     * @param value 值
     * @param exp 过期时间(ms)
     * @returns void
     */
    static async setNoError(key: string, value: string, exp: number): Promise<any> {
        return await redis.setNoError(key, value, exp);
    }

    /**
     * @description 重命名Key 无错误版本
     * @param oldKey
     * @param newKey
     * @returns void
     */
    static async renameNoError(oldKey: string, newKey: string): Promise<any> {
        return await redis.renameNoError(oldKey, newKey);
    }

    /**
     * 删除某个Key
     * @param key Key
     */
    static async del(key: string): Promise<any> {
        return await redis.del(key);
    }

    /**
     * 删除某个Key 无错误版本
     * @param key Key
     */
    static async delNoError(key: string): Promise<any> {
        return await redis.delNoError(key);
    }
}
