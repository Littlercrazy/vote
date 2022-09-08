/**
 * Created by Alex on 2019-08-02.
 */

'use strict';
import { Injectable, NestMiddleware } from '@nestjs/common';

/**
 * 尝试获取header的authorization
 * @param req
 */
function getTokenFromBearer(req) {
    const auth = req.headers.authorization;
    let token = '';

    if (auth) {
        const parts = auth.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
            token = parts[1];
        }
    }

    if (!token) {
        token = req.query.token;
    }

    return token;
}
@Injectable()
export class TokenMiddleware implements NestMiddleware {
    async use(req: any, res: any, next: () => void) {
        const token = getTokenFromBearer(req) || req?.cookies?.USER_TOKEN;
        if (token) {
            req.token = decodeURIComponent(token);
        } else {
            req.token = null;
        }
        next();
    }
}
