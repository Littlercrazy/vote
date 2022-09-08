### 项目目录结构
```
|---src
|   |
|   |---api
|   |   |---modules                           主模块的配置，下面可以有多个模块
|   |   |   |---admin                         admin 模块，
|   |   |       |---admin.controller.ts       admin 的控制器，一个模块下可以有多个 controller，只需要在.modules.ts 里面进行配置即可
|   |   |       |---admin.modules.ts          admin 的模块依赖加载配置，可以在这里进行 service，orm，mq，redis 等等的模块依赖加载
|   |   |   |---vote                          vote 模块，
|   |   |       |---vote.controller.ts        vote 的控制器，一个模块下可以有多个 controller，只需要在.modules.ts 里面进行配置即可
|   |   |       |---vote.modules.ts           vote 的模块依赖加载配置，可以在这里进行 service，orm，mq，redis 等等的模块依赖加载
|   |   |---app.modules.ts                    主模块里面的各个模块的引入和配置
|   |   |---main.ts                           程序入口，各类需要在启动前初始化的模块，中间件等等集合入口
|   |
|   |---core
|   |   |---decorators                        自定义的装饰器文件夹
|   |   |---dto                               api 和 grpc 请求入参配置文件夹，包括校验逻辑
|   |   |---entity                            orm 的 entity 的配置文件夹
|   |   |---enums                             项目的各类枚举配置文件夹
|   |   |---interfaces                        项目的各类接口定义配置文件夹
|   |   |---middleware                        
|   |   |   |---filters                       过滤器配置文件夹，用于异常信息的过滤之后的统一格式
|   |   |   |---guard                         守卫配置文件夹，用于鉴权
|   |   |   |---interceptors                  拦截器配置文件夹，用于各类异常，超时，日志，结果封装等等配置
|   |   |   |---middleware                    各类全局中间件，比如日志挂载，登陆信息识别，app 信息识别，语种识别等等
|   |   |   |---pipes                         入参校验管道，主要配合：class-validator 进行入参校验，包括 body, query, params 等
|   |   |                  
|   |   |---proto                             本项目私有的协议文件配置文件夹
|   |   |---service                           全局的 service 文件，可以用于 api, grpc, tasks 等
|   |   |---utils               
|   |   |   |---config.util.ts                全局的 config 配置工具类
|   |   |   |---index.ts                      utils 的入口集合文件
|   |   |   |---redis.util.ts                 全局的 redis配置工具类
|   |
|   |
|   |---grpc
|   |   |---config                            grpc 服务的配置文件，yaml 文件
|   |   |---modules                           grpc 服务的主模块文件夹，下面可以有多个模块
|   |   |   |---users                         Users 模块，
|   |   |       |---users.controller.ts       users 的控制器，一个模块下可以有多个 controller，只需要在.modules.ts 里面进行配置即可
|   |   |       |---users.modules.ts          users 的模块依赖加载配置，可以在这里进行 service，orm，mq，redis 等等的模块依赖加载
|   |   |---app.modules.ts                    主模块里面的各个模块的引入和配置
|   |   |---main.ts                           程序入口，各类需要在启动前初始化的模块，中间件等等集合入口
|   |
|   |---tasks                                 各类定时任务，mq 消费，一次性任务等等配置文件夹，默认没有配置。
|
|---config
|   |
|   |---base.ts                               全局通用的配置
|   |---locale.ts                             本地开发的配置
|   |---dev.ts                                局域网开发环境的配置
|   |---beta.ts                               测试环境的配置
|   |---prod.ts                               生产环境的配置
|                   
|---test                   
|   |                   
|   |---index.js                              单元测试入口
|   |---modules                               各个模块的单元测试
|   |   |---fcoin                             f币测试模块
|   |   |---fzuan                             f钻测试模块
|   |   |---subscribe                         订阅测试模块
|                   
|---logs                                      日志文件
```

### 启动命令说明
第一次使用的时候先yarn, 并且需要 mysql 的数据库 和redis配置
再次运行npm start然后可以启动api服务
浏览器中访问：http://localhost:4041/api/v1/admin/login
项目集成swagger 访问http://localhost:4041/api
```
npm run start:ts: 启动api服务
npm run start: 启动api服务，有热启动
npm run lint: lint检查并自动修复
npm run test: 运行单元测试
```
