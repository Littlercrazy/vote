import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RedisUtil } from '@utils/redis.util';

async function isLogin(req) {
    console.log('req.token:', req.token);
    // return true;
    const str = await RedisUtil.getNoError(`token:${req.token}`);
    if(str) {
        try {
            const admin = JSON.parse(str);
            if(admin?.id) {
                return true;
            }
        } catch(error) {
            console.log(error);
            return false;
        }
    }

    return false;
}

@Injectable()
export class LoginGuard implements CanActivate {
    canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        return isLogin(req);
    }
}
