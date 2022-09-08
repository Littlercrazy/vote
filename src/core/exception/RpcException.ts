/**
 * Created by Alex on 2019-09-19.
 */
'use strict';

// node系统使用的 rpc异常
export class RpcException extends Error {
    errorCode: number;
    i18nKeywords?: string[];
    errorMessage?: string;
    body?: any;

    constructor(errorCode, errorMessage = '', ...i18nKeywords: string[]) {
        super();
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.i18nKeywords = i18nKeywords;
    }
}
