#!/bin/bash
echo "1. 准备编译项目"

echo "2. 准备删除dist"
rm -rf ./dist

echo "3. 开始编译ts"
tsc -p tsconfig.build.json

echo "4. copy 协议文件"
cp -rf ./src/core/proto ./dist/src/core/

echo "5. copy grpc配置文件"
cp -rf ./src/grpc/config ./dist/src/grpc/config/