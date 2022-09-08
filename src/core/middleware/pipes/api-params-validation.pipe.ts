/**
 * Created by Alex on 2019-08-07.
 */

'use strict';
import { ApiException } from '@exception/index';
import { ArgumentMetadata, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {validate, ValidationError} from 'class-validator';
import { ErrorCode } from '../../enums/api-code.enum';

// import {ErrorCode} from '../enums/api-code.enum';

@Injectable()
export class ApiParamsValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {

        const { metatype } = metadata;

        // 如果参数不是 类 而是普通的 JavaScript 对象则不进行验证
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        // 通过元数据和对象实例，去构建原有类型
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            // 获取到第一个没有通过验证的错误对象
            const error = this.getError(errors);
            const constraints = error.constraints;
            const contexts = error.contexts;
            // 将未通过验证的字段的错误信息和状态码，以ApiException的形式抛给我们的全局异常过滤器
            for (const key in constraints) {
                if (constraints.hasOwnProperty(key)) {
                    let errorCode = ErrorCode.PARAM_ERROR;
                    let keywords = [constraints[key]];
                    if (contexts && contexts[key]) {
                        if (contexts[key].errorCode) { errorCode = contexts[key].errorCode; }
                        if (contexts[key].keywords) { keywords = contexts[key].keywords; }
                    }
                    throw new ApiException(errorCode, HttpStatus.BAD_REQUEST, ...keywords);
                }
            }

        }

        return object;
    }

    private toValidate(metatype): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find((type) => metatype === type);
    }

    private getError(errors: ValidationError[]): ValidationError {
        // 获取到第一个没有通过验证的错误对象
        const error = errors.shift();
        // 针对嵌套对象类验证校验
        if (error.children && error.children.length > 0) {
            return this.getError(error.children);
        }
        return error;
    }
}
