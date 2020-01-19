---
layout:     post
title:      "Nginx负载均衡到node节点"
subtitle:   "如何使用nginx做node的负载均衡"
date:       2019-12-12
author:     "diggzhang"
category: "node"
tags:
    - node
    - nginx
---


## nginx负载均衡node节点

本文提供一种docker容器环境下，以nginx负载均衡到多个node.js节点的方法。其中：

1. 使用docker-compose启动nginx
2. 提供nginx负载均衡配置文件

希望读者可以用该方法实现简单的负载均衡，让服务吃压。为了让服务高可用，除了使用nginx负载以外，还可以考虑使用MQ做请求队列的方法。

### 1. 启动多个node节点

node节点是一个简单的http服务，get请求后返回`node listening on: 端口号`的字样。默认启动两个node，分别监听到3000和3001端口。

```javascript
// app.js
require('http').createServer(function (request, response) {
  response.end('node listening on: '+process.argv[2]);
}).listen(process.argv[2]);
```

启动方法：

```
node app.js 3000 
node app.js 3001
```

启动完成后请求你的本地IP:端口，确认服务是否正常，以IP`10.8.17.164`为例:

```
curl 10.8.17.164:3000
curl 10.8.17.164:3001
```

### 2. nginx配置

启动nginx需要准备两个文件，一个是`nginx.conf`服务配置，另一个是`docker-compose.yml`容器配置。这两个文件放到同一个目录下。

`nginx.conf`的文件内容如下：

```
worker_processes  1;
events {
    worker_connections  1024;
}
http {
     upstream node_server_pool {
       server 10.8.17.164:3001 max_fails=1;
       server 10.8.17.164:3000 max_fails=1;
    }
    server{
      listen       80;
      server_name localhost;
      location /
      {
        proxy_pass http://node_server_pool;
      }
    }
}
```

关键配置是`upstream node_server_pool`配置项内，申明了两个node服务的地址。然后在`server`配置项目，申明nginx默认使用80端口，当请求`/`路径时候，代理到`node_server_pool`配置项内。


`docker-compose.yml`容器配置文件内容配置如下，注意`ports`中，将默认的80端口映射到8080：

```
nginx:
  container_name: nginx
  image: nginx
  restart: unless-stopped
  ports:
    - 8080:80
  volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
  environment:
    - TZ=Asia/Shanghai
```

完成上述两个文件配置后，就可以启动nginx了:

```
docker-compose -f docker-compose.yml up -d
```

### 3. 测试是否生效

使用curl多次请求可以见到负载均衡效果，不同请求落到了不同node节点上：

```
curl 10.8.17.164:8080
node listening on: 3000%   

curl 10.8.17.164:8080
node listening on: 3001%
```

---

本文示例代码[github链接](https://github.com/diggzhang/nginx-proxy-node)