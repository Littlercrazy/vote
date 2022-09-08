'use strict';

const path = require('path');

const _ = require('lodash');
const moment = require('moment');
const winston = require('winston'); // v2.x required
const WinstonDailyRotateFile = require('winston-daily-rotate-file'); // v2.0.0-beta required


// normal-YYYY-MM-DD.log
const log = new winston.Logger({
    transports: [
        new WinstonDailyRotateFile({
            // %DATE% 表达式在 winston-daily-rotate-file@2.0.0-beta 之后版本才支持
            filename: path.join(__dirname, '../../../../logs/normal-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            prepend: true,
            maxFiles: 14,
            json: false,
            formatter: options => {
                const {
                    level,
                    message,
                    meta
                } = options;
                return JSON.stringify({
                    time: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    level,
                    msg: {
                        message,
                        meta
                    }
                });
            }
        })
    ],
    filters: [
        (level, message, meta) => {
            if (message) {
                return passwordFilter(message);
            } else {
                meta = JSON.stringify(meta);
                meta = passwordFilter(meta);
                meta = JSON.parse(meta);
                return {
                    message,
                    meta
                };
            }
        }
    ]
});

// call-YYYY-MM-DD.log
const grpcLog = new winston.Logger({
    transports: [
        new WinstonDailyRotateFile({
            // %DATE% 表达式在 winston-daily-rotate-file@2.0.0-beta 之后版本才支持
            filename: path.join(__dirname, '../../../../logs/call-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            prepend: true,
            maxFiles: 14,
            json: false,
            formatter: options => {
                return JSON.stringify(options.meta);
            }
        })
    ],
    filters: [
        (level, message, meta) => {
            if (message) {
                return passwordFilter(message);
            } else {
                meta = JSON.stringify(meta);
                meta = passwordFilter(meta);
                meta = JSON.parse(meta);
                return {
                    message,
                    meta
                };
            }
        }
    ]
});

// life-YYYY-MM-DD.log
// 专门存储重要日志
const lifeLog = new winston.Logger({
    transports: [
        new WinstonDailyRotateFile({
            // %DATE% 表达式在 winston-daily-rotate-file@2.0.0-beta 之后版本才支持
            filename: path.join(__dirname, '../../../../logs/life-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            prepend: true,
            maxFiles: 14,
            json: false,
            formatter: options => {
                return JSON.stringify(options.meta);
            }
        })
    ]
});

// 只有在以下部署环境下，才将日志输出到控制台，否则仅输出到文件
if (process.env.NODE_LOG !== 'hide') {
    log.add(winston.transports.Console, {
        handleExceptions: true,
        prettyPrint: true,
        silent: false,
        timestamp: true,
        colorize: true,
        formatter: options => {
            const {
                level,
                message,
                meta
            } = options;

            if (meta && meta.type === 'HTTP') {
                let log = `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')} - HTTP ${
                    meta.status} ${meta.method} ${meta.url}. ip: ${meta.ip}\n\treq:${
                    JSON.stringify({ querystring: meta.querystring, payload: meta.payload })}`;
                if (meta.response) log += `\n\tres:${JSON.stringify(meta.response)}`;

                if (meta.status.toString().startsWith('5')) return `\x1b[31m${log}\x1b[0m`;
                else if (meta.status.toString().startsWith('4')) return `\x1b[33m${log}\x1b[0m`;
                else return `\x1b[32m${log}\x1b[0m`;
            }

            return `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')} - ${level.toUpperCase()} ${
                message || ''}${meta && Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }
    });
    grpcLog.add(winston.transports.Console, {
        handleExceptions: true,
        prettyPrint: true,
        silent: false,
        timestamp: true,
        colorize: true,
        formatter: options => {
            const {
                time,
                dst_ip: ip,
                dst_srv: srv,
                request_content, // eslint-disable-line
                response_content: res, // eslint-disable-line
                status,
                msg
            } = options.meta; // eslint-disable-line

            const elapsed_time = (msg ? msg.resTimestamp : 0) - (msg ? msg.reqTimestamp : 0); // eslint-disable-line

            // eslint-disable-next-line
            let log = `${time} - GRPC code: ${status} ${srv} ${ip} elapsed_time: ${elapsed_time}\n\treq:${JSON.stringify(request_content)}`;
            if (res) log += `\n\tres:${JSON.stringify(res)}`;
            return `\x1b[34m${log}\x1b[0m`;
        }
    });
    lifeLog.add(winston.transports.Console, {
        handleExceptions: true,
        prettyPrint: true,
        silent: false,
        timestamp: true,
        colorize: true,
        formatter: options => {
            const {
                level,  // eslint-disable-line
                message,
                meta
            } = options;
            return `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')} - ${2} ${
                message || ''}${meta && Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }
    });
}

function passwordFilter (str) {
    // 如果包含密码字段才走替换逻辑,原先的替换如果密码字段是空字符，会破坏json字符串格式，导致parse报错...
    if (str.indexOf('password') !== -1) {
        str = str.replace(/"password": "(.*?)"/g, '"password":"******"');
        str = str.replace(/"userpassword": "(.*?)"/gi, '"UserPassword":"******"');
    }
    return str;
}

/**
 * 打印 grpc 调用日志
 * @Author   https://github.com/modood
 * @DateTime 2017-12-05 09:43
 * @param    {string} ipport - 服务方 IP:PORT
 * @param    {string} srvMethod - 服务和方法名称
 * @param    {number} reqTimestamp - 请求开始时间戳（ms）
 * @param    {object} request - 请求参数
 * @param    {number} resTimestamp - 响应时间戳（ms）
 * @param    {object} response - 响应结果
 * @param    {number} code - 响应状态码
 * @param    {object} meta - 其它数据
 */
log.grpc = (ipport, srvMethod, reqTimestamp, request, resTimestamp, response, code, meta) => {
    if (['filegateway.upload', 'filegateway.uploadAvatarImage'].indexOf(srvMethod) > -1 && request && request.Content) {
        request.Content = 'Buffer data';
    }
    grpcLog.info({
        time: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        status: code,
        elapsed_time: resTimestamp - reqTimestamp,
        dst_srv: srvMethod,
        dst_ip: ipport,
        request_content: request,
        response_content: response,
        msg: _.assign({
            reqTimestamp,
            resTimestamp
        }, meta)
    });
};

/**
 * 打印 整个系统里面 最重要的日志
 * @DateTime 2019-10-25 16:43
 * @param    {object} msg - 要打印的数据
 */
log.life = (...msg) => {
    const meta = [...msg];
    lifeLog.info({
        time: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        msg: meta
    });
};

const L_SILENCE = 1 << 0; // 静默输出
const L_ERROR = 1 << 1; // 仅输出 error 日志
const L_WARN = 1 << 2; // 仅输出 warn, error 日志
const L_INFO = 1 << 3; // 输出 info 以及 warn, error 日志（默认）

function Log () {
    this._level = L_INFO;

    this.createLog = function (traceId = null) {
        const self = this;

        function _Log (traceId) {
            this.traceId = traceId;

            this.info = function (...args) {
                self.info(...args, this.traceId);
            };
            this.error = function (...args) {
                self.error(...args, this.traceId);
            };
            this.warn = function (...args) {
                self.warn(...args, this.traceId);
            };
            this.grpc = function (...args) {
                self.grpc(...args, this.traceId);
            };
            this.life = function (...args) {
                self.life(...args, this.traceId);
            };
        }

        return new _Log(traceId);
    };
}

Log.prototype.getLevel = function () {
    return this._level;
};

Log.prototype.setLevel = function (level) {
    if (level & (L_SILENCE | L_ERROR | L_WARN | L_INFO)) this._level = level;
};

Log.prototype.info = function (...args) {
    if (!(this._level & L_SILENCE) && (this._level & L_INFO)) log.info(...args);
};

Log.prototype.warn = function (...args) {
    if (!(this._level & L_SILENCE) && (this._level & L_INFO | L_WARN)) log.warn(...args);
};

Log.prototype.error = function (...args) {
    if (!(this._level & L_SILENCE) && (this._level & (L_INFO | L_WARN | L_ERROR))) log.error(...args);
};

Log.prototype.grpc = function (...args) {
    if (!(this._level & L_SILENCE) && (this._level & (L_INFO | L_WARN | L_ERROR))) log.grpc(...args);
};

Log.prototype.life = function (...args) {
    log.life(...args);
};

module.exports = new Log();

module.exports.L_SILENCE = L_SILENCE;
module.exports.L_ERROR = L_ERROR;
module.exports.L_WARN = L_WARN;
module.exports.L_INFO = L_INFO;
