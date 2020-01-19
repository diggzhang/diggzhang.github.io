---
layout:     post
title:      "MongoDB单机启动配置文件"
subtitle:   "生产环境的MongoDB启动配置文件最佳实践"
date:       2016-11-21
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: "MongoDB小司机"
tags:
     - mongodb
---

我们在单机环境下使用MongoDB做数据分析已经有一年了。单击环境下部署MongoDB，虽然简单，但也有一些实践上的的小坑。


### MongoDB配置文件

对于`mongod`实例的启动配置文件想说的都直接写在下面的配置文件中，有哪些基础配置必须，配置的意义是什么下面都有写：

```shell
# mongod.conf

# 1. 默认db存储目录权限
# /databackup/mongo-bin-tools/db

#where to log
# 2. log最好分盘
logpath=/databackup/mongo-bin-tools/db/mongod.log

# 3. 追加方式log刷盼，保留日日志非常重要！非常重要！
# 如果服务器突然断电
logappend=true

# fork and run in background
# 4. fork it
fork=true

# 5. 避开默认端口
port=27018

# 6. db目录
dbpath=/databackup/mongo-bin-tools/db/

# location of pidfile
pidfilepath=/databackup/mongo-bin-tools/db/mongod.pid

# Listen to local interface only. Comment out to listen on all interfaces.
# 7. 绑定ip保证内网访问
bind_ip=127.0.0.1,10.8.8.xxx

# 8. 当然要wt引擎
storageEngine=wiredTiger

# 9. 不同数据库分存在不同目录下
directoryperdb=true
```

### 单机部署MongoDB硬件环境：

doc参考：MongoDB官方配置白皮书

### MongoDB实例崩溃自动重启

主要是`python + cronjob`实现。

所有代码参考链接 [GitHub](https://github.com/diggzhang/mongodbInstanceMonitStuff)
