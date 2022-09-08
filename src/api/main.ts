// import '@fmfe/core/dist/alias';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import { ApplicationModule } from './app.module';

import { AllExceptionFilter } from '@filters/all-exception.filter';
import { LoggingInterceptor } from '@interceptors/logging.interceptor';
import { ResultInterceptor } from '@interceptors/result.interceptor';
import { TimeoutInterceptor } from '@interceptors/timeout.interceptor';
import { CorsMiddleware } from '@middleware/cors.middleware';
import { TokenMiddleware } from '@middleware/token.middleware';
import { ApiParamsValidationPipe } from '@pipes/api-params-validation.pipe';
import { CONFIG } from '@utils/config.util';
const logger = require('../core/utils/logger')

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);
    // 挂载全局 request 公用工具，参数等
    app.use((request, response, next) => {
        request._ip = request.headers['x-real-ip'] || request.connection.remoteAddress || request.ip;
        const reqLog = 'ip: ' + request?._ip + ', method: ' + request?.method + ', url: ' + request?.originalUrl;
        request._logBody = reqLog;
        request._logTime = new Date().getTime();
        request.logger = logger.createLog(request.traceId);  // 挂载日志
        next();
    });

    app.use(helmet()); // 设置与安全相关的 HTTP 头
    app.use(cookieParser());

    app.use(new TokenMiddleware().use);
    app.use(new CorsMiddleware().use);

    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalInterceptors(new ResultInterceptor());
    app.useGlobalInterceptors(new TimeoutInterceptor());
    app.useGlobalPipes(new ApiParamsValidationPipe());
    app.useGlobalFilters(new AllExceptionFilter(app.getHttpAdapter()));
    app.setGlobalPrefix('/api/v1');
    const options = new DocumentBuilder()
    .setTitle('选举投票系统接口文档')
    .setDescription('选举投票系统接口文档')
    .setVersion('1.0.0')
    .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/api', app, document);
    await app.listen(CONFIG.port, () => {
        console.log('服务已经启动，监听端口是: ', CONFIG.port);
    });
    // tslint:disable-next-line
    process.on('SIGINT', function () {
        console.log('程序接收到退出信息, 3秒后退出');
        // tslint:disable-next-line
        setTimeout(function () {
            process.exit(0);
        }, 3000);
    });
}

bootstrap();
