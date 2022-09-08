/**
 * Created by Alex on 2019-10-29.
 */

'use strict';

import { InjectRequest } from '@decorators/Inject-request';

export abstract class BaseService {

    @InjectRequest() public readonly request;
    /**
     * 注意如果后期新增request挂载的工具，这里也要初始化
     */
}
