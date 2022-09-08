/**
 * Created by Alex on 2019-08-15.
 */

'use strict';
import { HttpStatus, Injectable, NestMiddleware, RequestMethod } from '@nestjs/common';
import { CONFIG, ConfigUtil } from '../../utils/config.util';

/**
 * 判断白名单
 * @param origin
 */
function checkWhiteHost(origin: string): boolean {
    if (!origin) {
        return false;
    }

    const ao = CONFIG.WHITE_HOST || [];
    for (const k of ao) {
        if (origin.indexOf(k) !== -1) {
            return true;
        }
    }

    return false;
}

/**
 *  跨域检测，头部配置
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
    async use(request: any, response: any, next: () => void) {
        const getMethod = (method) => RequestMethod[method];
        const origin = request.headers.origin || '';
        const allowedMethods = [
            RequestMethod.GET,
            RequestMethod.HEAD,
            RequestMethod.PUT,
            RequestMethod.POST,
            RequestMethod.OPTIONS,
            RequestMethod.DELETE];
        const allowedHeaders = ['Engaged-Auth-Token', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Origin',
            'Cache-Control', 'Content-Type', 'lang', 'Authorization', 'Content-Length', 'X-Requested-With', 'withCredentials', 'x-sdk-info', 'x-app-info', ''];

        // Allow Origin
        if (!ConfigUtil.isProduction || checkWhiteHost(origin) || request.method === getMethod(RequestMethod.OPTIONS)) {
            response.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            response.setHeader('Access-Control-Allow-Origin', '*');
        }

        // Headers
        response.header('Access-Control-Allow-Headers', allowedHeaders.join(','));
        response.header('Access-Control-Allow-Methods', allowedMethods.map(getMethod).join(','));
        response.header('Access-Control-Max-Age', 86400);
        response.header('Content-Type', 'application/json; charset=utf-8');
        response.header('Cache-Control', 'no-cache'); // 304 etag
        // response.header('X-Powered-By', `nestjs`);
        response.header('X-Content-Make-Team', 'Followme Frontend');
        response.header('X-Content-Make-Proj', 'Followme Templet Api');
        response.header('Access-Control-Allow-Credentials', true);
        // OPTIONS Request
        if (request.method === getMethod(RequestMethod.OPTIONS)) {
            return response.sendStatus(HttpStatus.NO_CONTENT);
        }
        next();
    }
}
