'use strict';

/**
 * 响应API的错误业务状态码
 */
export enum ErrorCode {
    // GLOBAL 全局使用 全字母大写
    UNKNOWN_ERROR = 2999999,// 未知错误
    DEFAULT_EXCEPTION = 10000,
    USER_NOT_EXISTS = 10001, // 用户不存在
    USER_PWD_ERROR = 10002, // 密码错误
    USER_NO_LOGIN = 10003, // 用户未登录
    PARAM_ERROR= 10004 // 参数错误,
}

/**
 * 响应API的正确业务状态码
 */

export enum SuccessCode {
    SUCCESS = 0,
    HTTP_OK
}
