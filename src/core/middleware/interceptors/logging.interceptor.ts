import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        return next
            .handle()
            .pipe(tap(() =>
                console.log(`${request?._logBody}, consuming: ${new Date().getTime() - request?._logTime}ms, status: ${response.statusCode}`)
            ));
    }
}
