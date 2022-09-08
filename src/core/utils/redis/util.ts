import { LibRedisConfig } from './redis';
import { createHash } from 'crypto';

/**
 * 根据redis参数生成key值，用于缓存连接
 * @param options
 */
export function genRedisCacheKey(options: LibRedisConfig) {
    const { keyPrefix, host, port, db } = options;
    const str = `${keyPrefix || ''}_${host || '127.0.0.1'}_${port || 6379}_${db || 0}`;
    const md5 = createHash('md5');
    return md5
        .update(str)
        .digest('hex')
        .toUpperCase();
}

/**
 * lib-redis 自用的错误类型
 */
export class LibRedisException extends Error {
    constructor(message?: string, stack?: string) {
        super(`LibRedis Exception: ${message}`);
        this.name = 'LibRedisException';
        this.stack = stack;
    }
}

/**
 * 装饰器，用于装饰LibRedis的方法
 * @param throwError 是否抛出异常
 * @param async 是否异步方法
 */
export function ConvertRedisErrorCatch<T>(params: { throwError?: boolean; async?: boolean } = {}): MethodDecorator {
    const { throwError, async } = params;
    return function(target: T, methodName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        if (async) {
            descriptor.value = async function(...args: any[]) {
                try {
                    return await method.apply(this, args);
                } catch (error) {
                    const msg = error && error.message ? error.message : 'redis没有提供错误消息';
                    if (throwError) {
                        if (error instanceof LibRedisException) {
                            throw error;
                        } else {
                            throw new LibRedisException(msg, error && error.stack ? error.stack : null);
                        }
                    } else {
                        return null;
                    }
                }
            };
        } else {
            descriptor.value = function(...args: any[]) {
                try {
                    return method.apply(this, args);
                } catch (error) {
                    const msg = error && error.message ? error.message : 'redis没有提供错误消息';
                    if (throwError) {
                        if (error instanceof LibRedisException) {
                            throw error;
                        } else {
                            throw new LibRedisException(msg, error && error.stack ? error.stack : null);
                        }
                    } else {
                        return null;
                    }
                }
            };
        }
    };
}
