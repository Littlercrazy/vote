/**
 * Created by Alex on 2019-09-19.
 */
'use strict';

export class ApiException extends Error {

    errorCode: number;
    statusCode: number;
    i18nKeywords?: string[];
    errorMessage?: string;
    body?: any;

    constructor(errorCode, statusCode = 200, ...i18nKeywords: string[]) {
        super();
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.i18nKeywords = i18nKeywords;
    }
}
