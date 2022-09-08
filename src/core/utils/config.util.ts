/**
 * Created by Alex on 2019-08-13.
 */
'use strict';
import base_config from '../../../config/base';
import beta_config from '../../../config/beta';
import dev_config from '../../../config/dev';
import locale_config from '../../../config/locale';
import prod_config from '../../../config/prod';

export class ConfigUtil {
    static get isProduction() {
        return process.env.NODE_ENV === prod_config.env;
    }
    static get isTASK() {
        return process.env.NODE_TYPE === 'task';
    }
}

console.log('当前环境是: ', process.env.NODE_ENV);
export const CONFIG = Object.assign(base_config, {
    [dev_config.env]: dev_config,
    [prod_config.env]: prod_config,
    [beta_config.env]: beta_config,
    [locale_config.env]: locale_config
}[process.env.NODE_ENV] || locale_config);
