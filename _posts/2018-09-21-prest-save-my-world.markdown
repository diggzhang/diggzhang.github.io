---
layout:     post
title:      "使用pREST构建RESTful API服务"
subtitle:   "就让postgresql统治世界吧"
date:       2018-09-21
author:     "diggzhang"
category: "postgresql"
tags:
    - postgresql
---

[pREST](http://postgres.rest) is a way to serve a RESTful API from any databases written in Go.

具体使用方法官方doc已经写得很明白，如果是`brew install prest`的话，有个小坑就是所下载的prest是较低版本的，不支持`template`语法中的`inFormat`。如果着急尝鲜还是从github下载最新release较妥。

但是，真正爽的是，将`prest`容器化的尝试。用`docker-compose`去维护一个服务。

### compose文件示例

这里创建一个`docker-compose-metrics-data-monitor.yml`作为compose配置文件，主要分两个部分，先启动pg，然后挂prest出去：

```shell
version: '0.1'
services:
    postgres:
        # $ PGPASSWORD=whofuckinthemaster psql -h "localhost" -p 5433 -U master metrics_monitor_metadata
        image: postgres:9.6
        ports:
            - 5433:5432
        environment:
            - POSTGRES_USER=master
            - POSTGRES_PASSWORD=master_password
            - POSTGRES_DB=metrics_monitor_metadata
        # Uncomment these lines to persist data on the local filesystem.
            - PGDATA=/var/lib/postgresql/data
        volumes:
            - ./pgdata:/var/lib/postgresql/data

    prest:
        image: prest/prest
        depends_on:
            - postgres
        links:
            - postgres
        environment:
            - PREST_CONF=/prest.toml
        ports:
            - "3000:3000"
        volumes:
            - ./prest.toml:/prest.toml
            - ./_quereies_api:/_quereies_api
```

### prest.toml示例

首先构建一个`prest.toml`:

```
debug=true

[pg]
host = "postgres"
user = "master"
pass = "whofuckinthemaster"
port = 5432
database = "metrics_monitor_metadata"

[ssl]
mode = "disable"

[queries]
location = "_quereies_api"

[http]
port = 3000

[jwt]
default = false
```

### 启动

```shell
$ tree ./
./
├── _quereies_api
│   └── metrics_alert
│       ├── something.read.sql
│       └── something.write.sql
├── config
│   └── postgresql.conf
├── docker-compose-metrics-data-monitor.yml
├── prest.toml

$ docker-compose -f ./docker-compose-metrics-data-monitor.yml up -d
$ docker-compose -f ./docker-compose-metrics-data-monitor.yml down 
```