---
layout:     post
title:      "WhereHows跑起来指南"
subtitle:   "真的只是跑起来而已"
date:       2018-12-10
author:     "diggzhang"
tags:
    - wherehows 
---

# WhereHows跑起来指南

决定试试`WhereHows`了，但是却发现这玩意搭起来真费劲。本文通过官方提供的`docker`成功将wherehows跑起来了，但是依然存在很多问题。

最终结果是：

1. 成功启动编排容器但是需要一些准备工作
2. 成功登陆管理页面但是页面很多功能不知道怎么用
3. 最终尝试成功的版本是`git checkout v1.0.0`，我在`v1.1.0`即使按照issue配置LDAP后依然无法验证通过


## 准备工作

总之先clone源码吧：

```shell
git clone https://github.com/linkedin/WhereHows.git
cd WhereHows
```

有几个第三方的jar包需要注册到官网后才能下载，其实用到的是：

- 一个jdbc-drive叫[terajdbc4.jar](https://downloads.teradata.com/download/connectivity/jdbc-driver)
- [ojdbc7.jar](http://download.oracle.com/otn/utilities_drivers/jdbc/121010/ojdbc7.jar)
- [orai18n.jar](http://download.oracle.com/otn/utilities_drivers/jdbc/121010/orai18n.jar)
- [gsp.jar](http://www.sqlparser.com/dlaction.php?fid=gspjava&ftitle=General%20SQL%20Parser%20Java%20version)

我准备好了一份存到了[云盘](https://pan.baidu.com/s/10knbBuD_IzFEDJ-PXzFZVg)。下载完成后需要到放到`wherehows-etl/extralibs/`目录下：

```
tree ./wherehows-etl/extralibs
├── gsp.jar
├── ojdbc7.jar
├── orai18n.jar
├── tdgssconfig.jar
└── terajdbc4.jar
```
如果jar包没有准备会在后续build阶段报错。

切换版本到`v1.0.0`，这里是为了绕开LDAP验证问题，默认最新版本走的是LDAP验证，需要大量配置且没有跑成功：

```
git checkout v1.0.0
```

针对`WhereHows`的准备工作算是完成，然后就是需要对其前端做些前置工作，否则会在后续docker build阶段报错说无法找到部分前端包，这里需要准备好**npm**和**bower**，然后提前把`node_modules`下载好：

```
cd wherehows-web
cnpm install
bower install
```

然后就是安装docker/docker-compose，然后这里的npm/cnpm切到了国内源。

避坑完成。

## 编译

这里可以完全按照官方[](https://github.com/linkedin/WhereHows/blob/master/wherehows-docker/README.md)

回到`WhereHows`主目录，开始编译吧，这里需要下载一些依赖，我的某次尝试build时间是`55min`：

```
cd wherehows-docker
./build.sh 1
```

且让他慢慢build，我们可以看看在`build.sh`中主要是干了些啥。

第一个步骤是用`gradlew`到各个目录做编译，然后生成了各个组件打好的zip包：

```
Build the application's distribution zip
(cd .. && ./gradlew dist)
```

第二个步骤就是将上面的zip包拷贝进docker容器中，并完成初始配置：

```
# Build docker images
(cd wherehows-frontend && ./build.sh $VERSION)
(cd wherehows-backend && ./build.sh $VERSION)
(cd wherehows-mysql && ./build.sh $VERSION)
```

所以可以将`build.sh`中的各个步骤单独拆出来执行，以便于定位错误：

```
(cd .. && ./gradlew dist)
(cd wherehows-frontend && ./build.sh 1)
(cd wherehows-backend && ./build.sh 1)
(cd wherehows-mysql && ./build.sh 1)
```

## 启动

编译完成后就可以用`docker-compose`启动编排了：

```
docker-compose up
```

启动后就可以访问到前端了，官方文档写得端口号是以最新版为准，而我们需要依照docker容器的实际映射端口为准，前端地址是：
**[http://localhost:9000](http://localhost:9000)**。

访问到了，但是没有用户名密码进不去。


## 权限设置

容器启动后会自动初始化`WhereHows`所有库表，需要找个`MySQL`连接器手工在`users`表中创建你的账户。

MySQL server连接信息:

- host:localhost
- port:3306
- database: wherehows
- user: wherehows
- password: wherehows

然后执行下面的SQL语句创建一个账户密码均为`wherehows`的用户：

```
INSERT INTO wherehows.users (
    name,
    email,
    username,
    password_digest,
    password_digest_type,
    authentication_type
) VALUES (
    'wherehows',
    'wherehows@wherehows.com',
    'wherehows',
    SHA1('wherehows'),
    'SHA1',
    'default'
);
```

创建成功后，`wherehows`账户就可以在前端登录了。

## 结束

T_T 然鹅事实上，千里之行不过是第一步。还请多多指教。

目前可以提供的情报是：

- 关于`wherehows`数据血缘分析问题，这个东西目前只支持师出同门的`linkedin azkaban`
- 有个交流非常活跃的微信群[在这里](https://github.com/linkedin/WhereHows/issues/1457)