import { CONFIG } from '@utils/config.util';
import * as uidsafe from 'uid-safe';
import { Request, Response } from 'express';
import * as _ from 'lodash';
const uid = uidsafe.sync;

export class CookieUtil {
    static setCookie(req: Request, res: Response, newToken: string): void {
        try {
            // 直接req可以兼容 express和koa
            let host = req.hostname || '';
            if (host.split('.').length >= 3) {
                host = host.substr(host.indexOf('.'), host.length);
            }

            const cookie = _.cloneDeep(CONFIG.COOKIE);
            cookie.domain = host || cookie.domain;

            if (res.cookies) {
                // 兼容koa
                res.cookies.set('USER_TOKEN', newToken, cookie);
            } else if (res.cookie) {
                res.cookie('USER_TOKEN', newToken, cookie);
            }
        } catch (e) {
            console.log('setCookie catch: ', e);
        }
    }

    /**
     * 生成token
     * 返回一个字符串
     */
    static getToken() {
        // 这里的tokent需要过滤特殊字符，保留数字和字母
        const ticket = uid(64).replace(/\s/g, '').replace(/\-/g, ~~(Math.random() * 10)).replace(/\_/g, ~~(Math.random() * 10));
        return ticket;
    }
}