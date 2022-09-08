# 依赖在单独的镜像中安装
FROM dockerhub.followme-internal.com/node/node-16.16:v1 as build-node-nest-demo
WORKDIR /app

COPY package.json /app
COPY yarn.lock /app
RUN yarn --production

# 构建项目镜像
FROM dockerhub.followme-internal.com/node/alinode-16.16:v1
LABEL maintainer="duanfeng@demo.com"
WORKDIR /app

ENV ENABLE_NODE_LOG=YES \
    NODE_LOG_DIR=/var/log

# logs目录根据个人需要，node项目需要些日志，需要该目录
RUN mkdir /app/logs

COPY . /app
COPY --from=build-node-nest-demo /app/node_modules/ /app/node_modules

CMD ["sh", "/app/docker-run.sh"]
