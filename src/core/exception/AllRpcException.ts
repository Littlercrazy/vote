/**
 * Created by Alex on 2019-09-19.
 */
'use strict';

// 所有 服务端的 rpc异常
export class AllRpcException extends Error {
    readonly error;
    readonly message: any;

    constructor(error) {
        super();
        this.error = error;
        this.message = error;
    }

    getError() {
        return this.error;
    }

    toString() {
        const message = this.getErrorString(this.message);
        return `Error: ${message}`;
    }

    private getErrorString(target) {
        return typeof target === 'string' ? target : JSON.stringify(target);
    }
}
