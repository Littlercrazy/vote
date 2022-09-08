#!/bin/bash
tag=`head -1 CHANGELOG`

echo "当前tag----->$tag"

dockerhubdomain="dockerhub.test.com"
dockerhubgroup="deploy"

echo "当前仓库->$dockerhubgroup"

dockerImgName="node-vote"

echo "当前项目->$dockerImgName"
local_docker_image_name=$(printf '%s:%s' $dockerImgName $tag)
full_docker_image_name=$(printf '%s/%s/%s' $dockerhubdomain $dockerhubgroup $local_docker_image_name)

echo "开始构建项目"
npm run build

echo "开始构建镜像～～～～～～$local_docker_image_name"
docker build -t $local_docker_image_name  .

echo "构建完毕～～$local_docker_image_name～～开始尝试登录dockerhub～~~推送远程 $full_docker_image_name"
docker tag $local_docker_image_name $full_docker_image_name
docker push $full_docker_image_name
docker rmi $local_docker_image_name
docker rmi $full_docker_image_name
