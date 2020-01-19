---
layout:     post
title:      "Apache-airflow Docker容器部署以及定制思路"
subtitle:   "docker就是爽"
date:       2018-05-16
author:     "diggzhang"
category: "airflow"
tags:
    - airflow
---


### 背景

`Airflow`虽然好用，但是涉及到一些高级功能，需要部署很多配合的组件，使用`airflow-docker`项目，可以节省大量工作。

### docker安装

测试的操作系统环境是`CentOS 7`。`macOS`的docker各种麻烦。

主要参考文档是[阿里云 Docker CE 镜像源站
](https://yq.aliyun.com/articles/110806?spm=a2c1q.8351553.0.0.155ebc55BjEzPI)


关键步骤：

```
# step 1: 安装必要的一些系统工具
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
# Step 2: 添加软件源信息
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# Step 3: 更新并安装 Docker-CE
sudo yum makecache fast
sudo yum -y install docker-ce
```

```
#将当前用户加入docker组
sudo gpasswd -a ${USER} docker

sudo systemcl enable docker
sudo systemcl restart docker

docker ps
```

### docker-compose安装

```
sudo yum -y install epel-release
sudo yum -y install python-pip
sudo pip install docker-compose

docker-compose version

```

### 测试

```
docker pull puckel/docker-airflow
```

### 垃圾清理/如何删除docker镜像

```
docker rmi $(docker images -q)
docker rm $(docker ps -a -q)
```

### Docker部署Airflow CeleryExecutor模式

```
git clone https://github.com/puckel/docker-airflow.git

cd docker-airflow

# 启动
docker-compose -f docker-compose-CeleryExecutor.yml up -d

# 停止
docker-compose -f ./docker-compose-CeleryExecutor.yml stop

# 节点扩展
docker-compose -f docker-compose-CeleryExecutor.yml scale worker=5
docker-compose -f docker-compose-CeleryExecutor.yml scale scheduler=3

# 跑个命令行
docker-compose -f docker-compose-CeleryExecutor.yml run --rm webserver airflow list_dags
docker-compose -f docker-compose-CeleryExecutor.yml run --rm webserver /bin/bash


```

### 定制Airflow

其实所谓定制就是在docker镜像打包airflow时候用自己修改后的airflow源码，修改的源码如果放到github，就用pip install from github的方式安装airflow:

```
pip install -e git+https://github.com/diggzhang/airflow-dingding.git\#egg\=apache-airflow[crypto,celery,postgres,hive,jdbc,mysql]
```

依据这个方式，修改`Dockerfile`:

```
# VERSION 1.9.0-3
# AUTHOR: Matthieu "Puckel_" Roisil
# DESCRIPTION: Basic Airflow container
# BUILD: docker build --rm -t puckel/docker-airflow .
# SOURCE: https://github.com/puckel/docker-airflow

FROM python:3.6-slim
MAINTAINER Puckel_

# Never prompts the user for choices on installation/configuration of packages
ENV DEBIAN_FRONTEND noninteractive
ENV TERM linux

# Airflow
ARG AIRFLOW_VERSION=1.9.0
ARG AIRFLOW_HOME=/usr/local/airflow

# Define en_US.
ENV LANGUAGE en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
ENV LC_CTYPE en_US.UTF-8
ENV LC_MESSAGES en_US.UTF-8

RUN set -ex \
    && buildDeps=' \
        python3-dev \
        libkrb5-dev \
        libsasl2-dev \
        libssl-dev \
        libffi-dev \
        build-essential \
        libblas-dev \
        liblapack-dev \
        libpq-dev \
        git \
    ' \
    && apt-get update -yqq \
    && apt-get upgrade -yqq \
    && apt-get install -yqq --no-install-recommends \
        $buildDeps \
        python3-pip \
        python3-requests \
        mysql-client \
        mysql-server \
        libmysqlclient-dev \
        apt-utils \
        curl \
        rsync \
        netcat \
        locales \
    && sed -i 's/^# en_US.UTF-8 UTF-8$/en_US.UTF-8 UTF-8/g' /etc/locale.gen \
    && locale-gen \
    && update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 \
    && useradd -ms /bin/bash -d ${AIRFLOW_HOME} airflow \
    && pip install -U pip setuptools wheel \
    && pip install Cython \
    && pip install pytz \
    && pip install pyOpenSSL \
    && pip install ndg-httpsclient \
    && pip install paramiko \
    && pip install cryptography \
    && pip install pyasn1 \
    && pip install -e git+https://github.com/diggzhang/airflow-dingding.git\#egg\=apache-airflow[crypto,celery,postgres,hive,jdbc,mysql] \
    #&& pip install apache-airflow[crypto,celery,postgres,hive,jdbc,mysql]==$AIRFLOW_VERSION \
    && pip install celery[redis]==4.0.2 \
    && apt-get purge --auto-remove -yqq $buildDeps \
    && apt-get autoremove -yqq --purge \
    && apt-get clean \
    && rm -rf \
        /var/lib/apt/lists/* \
        /tmp/* \
        /var/tmp/* \
        /usr/share/man \
        /usr/share/doc \
        /usr/share/doc-base

COPY script/entrypoint.sh /entrypoint.sh
COPY config/airflow.cfg ${AIRFLOW_HOME}/airflow.cfg

RUN chown -R airflow: ${AIRFLOW_HOME}

EXPOSE 8080 5555 8793

USER airflow
WORKDIR ${AIRFLOW_HOME}
ENTRYPOINT ["/entrypoint.sh"]
```

然后重新打包镜像，默认成为latest：

```
docker build --rm -t puckel/docker-airflow .
```

### 定制docker-compose

按照`docker-compose-CeleryExecutor.yml`为例子，默认的compose是拉取某个版本的镜像包，修改成`latest`:

```
    webserver:
        image: puckel/docker-airflow:latest # 注意我改了这里
        restart: always
        depends_on:
```

完整示例：

```
version: '2.1'
services:
    redis:
        image: 'redis:3.2.7'
        # command: redis-server --requirepass redispass

    postgres:
        image: postgres:9.6
        environment:
            - POSTGRES_USER=airflow
            - POSTGRES_PASSWORD=airflow
            - POSTGRES_DB=airflow
        # Uncomment these lines to persist data on the local filesystem.
        #     - PGDATA=/var/lib/postgresql/data/pgdata
        # volumes:
        #     - ./pgdata:/var/lib/postgresql/data/pgdata

    webserver:
        image: puckel/docker-airflow:latest
        restart: always
        depends_on:
            - postgres
            - redis
        environment:
            - LOAD_EX=n
            - FERNET_KEY=46BKJoQYlPPOexq0OhDZnIlNepKFf87WFwLbfzqDDho=
            - EXECUTOR=Celery
            # - POSTGRES_USER=airflow
            # - POSTGRES_PASSWORD=airflow
            # - POSTGRES_DB=airflow
            # - REDIS_PASSWORD=redispass
        volumes:
            - ./dags:/usr/local/airflow/dags
            # Uncomment to include custom plugins
            # - ./plugins:/usr/local/airflow/plugins
        ports:
            - "8080:8080"
        command: webserver
        healthcheck:
            test: ["CMD-SHELL", "[ -f /usr/local/airflow/airflow-webserver.pid ]"]
            interval: 30s
            timeout: 30s
            retries: 3

    flower:
        image: puckel/docker-airflow:latest
        restart: always
        depends_on:
            - redis
        environment:
            - EXECUTOR=Celery
            # - REDIS_PASSWORD=redispass
        ports:
            - "5555:5555"
        command: flower

    scheduler:
        image: puckel/docker-airflow:latest
        restart: always
        depends_on:
            - webserver
        volumes:
            - ./dags:/usr/local/airflow/dags
            # Uncomment to include custom plugins
            # - ./plugins:/usr/local/airflow/plugins
        environment:
            - LOAD_EX=n
            - FERNET_KEY=46BKJoQYlPPOexq0OhDZnIlNepKFf87WFwLbfzqDDho=
            - EXECUTOR=Celery
            # - POSTGRES_USER=airflow
            # - POSTGRES_PASSWORD=airflow
            # - POSTGRES_DB=airflow
            # - REDIS_PASSWORD=redispass
        command: scheduler

    worker:
        image: puckel/docker-airflow:latest
        restart: always
        depends_on:
            - scheduler
        volumes:
            - ./dags:/usr/local/airflow/dags
            # Uncomment to include custom plugins
            # - ./plugins:/usr/local/airflow/plugins
        environment:
            - FERNET_KEY=46BKJoQYlPPOexq0OhDZnIlNepKFf87WFwLbfzqDDho=
            - EXECUTOR=Celery
            # - POSTGRES_USER=airflow
            # - POSTGRES_PASSWORD=airflow
            # - POSTGRES_DB=airflow
            # - REDIS_PASSWORD=redispass
        command: worker
```


### 参考链接

- [docker化airflow的主要项目](https://github.com/puckel/docker-airflow)
- [如何删除docker镜像](https://stackoverflow.com/questions/21398087/how-can-i-delete-dockers-images)
- [定位pip安装目录](https://stackoverflow.com/questions/122327/how-do-i-find-the-location-of-my-python-site-packages-directory)
