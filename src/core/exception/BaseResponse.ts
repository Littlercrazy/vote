/**
 * Created by Alex on 2019-09-19.
 */
'use strict';

export class BaseResponse {
    code: number = 0;
    data?: any = {};
    message?: string;
    error?: any;
}
