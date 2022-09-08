
import * as logger from '@fmfe/log';
import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class GrpcTracingInterceptor implements NestInterceptor {
    @Inject(REQUEST)
    private readonly request;

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToRpc().getContext();
        const res = context.switchToRpc().getData();

        const method = `${context.getClass().name}.${context.getHandler().name}`;

        // 默认获取traceId, 但是如果这个在第一个trace的入口，这个字段可能不存在，这个spanId会作为起始的id
        this.request.traceId = `${new Date().getTime()}-${Math.random() * 10000}`;
        this.request.logger = logger.createLog(req.traceId); // 挂载日志
        // 打印请求信息
        this.request.logger.info('rpc ', new Date(), method, '\n', 'request body：', res);
        return next.handle();
    }
}
