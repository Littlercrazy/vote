import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { CONFIG } from '@utils/config.util';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // const req = context.switchToHttp().getRequest();
        return next.handle().pipe(timeout(CONFIG.API_TIMEOUT));
    }
}
