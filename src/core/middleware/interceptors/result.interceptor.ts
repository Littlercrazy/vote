/**
 * Logging interceptor.
 * @file 响应结果拦截器
 * @author chenhao
 */

import { BaseResponse } from '@exception/index';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessCode } from '../../enums/api-code.enum';

@Injectable()
export class ResultInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // const request = context.switchToHttp().getRequest();
        return next.handle()
            .pipe(
                map((data) => {
                    const baseResponse: BaseResponse = {
                        code: SuccessCode.SUCCESS,
                        data
                    };

                    return baseResponse;
                })
            );
    }
}
