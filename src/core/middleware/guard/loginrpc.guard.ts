import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

async function isLogin(req) {
    return true;
}

@Injectable()
export class LoginGuard implements CanActivate {
    canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const req = context.switchToRpc().getContext();
        return isLogin(req);
    }
}
