/**
 * Created by Alex on 2019-08-14.
 */

'use strict';
import { ErrorCode, SuccessCode } from '@enums/api-code.enum';
import { AllRpcException, ApiException, BaseResponse, RpcException } from '@exception/index';
import {
    ArgumentsHost,
    Catch,
    ForbiddenException,
    HttpServer,
    HttpStatus,
    NotFoundException
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { MESSAGES } from '@nestjs/core/constants';
import { ConfigUtil } from '@utils/config.util';
import { TimeoutError } from 'rxjs';

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {

    // rpc 异常处理
    static RpcErrorHandle(exception: AllRpcException, baseResponse: BaseResponse, response, request) {
        const errorMsg = exception.message;
        let code = errorMsg.code;
        let message = '';
        if (errorMsg.details) {
            try {
                const details = JSON.parse(errorMsg.details);
                code = details.code || details.Code;
                message = details.message || details.Message || details.detail || details.Detail;
            } catch (e) {
                request.logger.error('rpc 异常 json 解析', errorMsg.details);
            }
        }
        baseResponse.message = message;
        baseResponse.code = code;
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(baseResponse);
    }

    constructor(applicationRef?: HttpServer) {
        super(applicationRef);
    }

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const baseResponse: BaseResponse = { code: SuccessCode.SUCCESS };
        let status = 0;
        try {
            request.logger.error('api 异常处理', exception);
            if (!ConfigUtil.isProduction) {
                baseResponse.error = exception;
            }
            if (exception instanceof ApiException) { // API 错误
                const code = exception.errorCode;
                let message = exception.errorMessage;
                if (code) {
                    baseResponse.code = code;
                    message = '';
                }
                baseResponse.message = message;
                status = exception.statusCode || HttpStatus.OK;

                request?.logger?.error(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${status}`);

                return response.status(status).json(baseResponse);
            } else if (exception instanceof RpcException) {// rpc 客户端链接异常等抛出的错误
                const code = exception.errorCode;
                let message = exception.errorMessage;
                if (code) {
                    baseResponse.code = code;
                    message = '';
                }
                baseResponse.message = message;
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                request?.logger?.error(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${status}`);
                return response.status(status).json(baseResponse);
            } else if (exception instanceof AllRpcException) {// RPC 错误
                return AllExceptionFilter.RpcErrorHandle(exception, baseResponse, response, request);
            } else if (exception instanceof NotFoundException) {
                status = HttpStatus.NOT_FOUND;
                request?.logger?.error(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${status}`);
                return response.status(status).json(exception.getResponse());
            } else if (exception instanceof TimeoutError) {
                request.logger.error('forbidden request', exception);
                baseResponse.code = ErrorCode.DEFAULT_EXCEPTION;
                baseResponse.message = 'time out';
                status = HttpStatus.GATEWAY_TIMEOUT;
                request?.logger?.error(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${status}`);
                return response.status(status).json(baseResponse);
            } else if (exception instanceof ForbiddenException) {
                request.logger.error('forbidden request', exception);
                baseResponse.code = ErrorCode.USER_NO_LOGIN;
                baseResponse.message = 'please login';
                status = HttpStatus.FORBIDDEN;
                request?.logger?.error(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${status}`);
                return response.status(status).json(baseResponse);
            }
            // 剩余未知错误
            request.logger.error('Unhandled exception', exception);
            baseResponse.code = ErrorCode.DEFAULT_EXCEPTION;
            baseResponse.message = MESSAGES.UNKNOWN_EXCEPTION_MESSAGE;

            status = HttpStatus.INTERNAL_SERVER_ERROR;
            request?.logger?.error(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${status}`);
            return response.status(status).json(baseResponse);
        } catch (e) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            request?.logger?.error(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${status}`);
            request?.logger?.error('AllExceptionFilter handled exception', e);
        }

        return super.catch(exception, host);
    }

}
