/**
 * Created by Alex on 2019-10-29.
 */

'use strict';
import {Inject} from '@nestjs/common';
import {REQUEST} from '@nestjs/core';
import {ConfigUtil} from '@utils/config.util';
import {noop} from 'rxjs';

export function InjectRequest() {
    if (!ConfigUtil.isTASK) {
        return Inject(REQUEST);
    }
    return noop;
}
