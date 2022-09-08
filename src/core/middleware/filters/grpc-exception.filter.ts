import { ErrorCode } from '@enums/api-code.enum';
import { ApiException, RpcException as MyRpcException } from '@fmfe/core';
import { I18n } from '@fmfe/i18n';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

/**
 * rpc 服务端用的异常捕获
 */
@Catch()
export class GrpcExceptionFilter extends BaseRpcExceptionFilter {
    catch(exception: any, host: ArgumentsHost): Observable<any> {
        console.log('这里是异常捕获', exception);
        const i18n = new I18n();
        if (exception instanceof MyRpcException || exception instanceof ApiException) {
            return super.catch(new RpcException(JSON.stringify({
                code: exception.errorCode || ErrorCode.UNKNOWN_ERROR,
                message: exception.errorMessage || i18n.getRpcI18nByCode(exception.errorCode, ...exception.i18nKeywords)
                    || i18n.getApiI18nByCode(exception.errorCode, ...exception.i18nKeywords),
                keywords: exception.i18nKeywords,
                detail: exception.stack
            })), host);
        }
        return super.catch(new RpcException(JSON.stringify({
            code: ErrorCode.UNKNOWN_ERROR,
            message: exception.message,
            detail: exception.stack
        })), host);
    }
}
