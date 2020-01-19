---
layout:     post
title:      "MongoDB增量备份工具测评"
subtitle:   "MongoDB到生产环境才能意识到的坑"
date:       2017-10-30
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: "MongoDB小司机"
tags:
    - mongodb
---

MongoDB放到生产环境许久以后才发现原来MongoDB好像没有特别方便的增量备份方案。一如既往的mongodump和mongorestore已经无法解决超大数据量级的问题。怎么办！！！

只好借用第三方工具了。

## basic test use environment

基础测试环境如下，构建主从节点AB：

```
[MongoDB Instance A]  <------> [MongoDB Instance B]
```

首先建立测试目录,用作MongoDB的数据库目录：

```shell
mkdir -p /tmp/mongotest/master
mkdir -p /tmp/mongotest/slave
```

然后构建主节点配置文件并启动监听到`27017`端口：

```shell
$ cat master.conf
dbpath=/tmp/mongotest/master/
directoryperdb=true  
logappend=true  
replSet=testrs  
port=27017  
oplogSize=10000  
noprealloc=true

$ mongod -f ./master.conf
```

构建从节点启动监听到`27018`:

```shell
$ cat slave.conf
dbpath=/tmp/mongotest/slave
directoryperdb=true  
logappend=true  
replSet=testrs  
port=27018
oplogSize=10000  
noprealloc=true

$ mongod -f ./slave.conf
```

主从服务器均启动后，在mongoshell里设置并开启主从：

```javascript
$ mongo -p 27017

> use admin
> config = {
	"_id" : "testrs",
	"members" : [
		{
			"_id" : 0,
			"host" : "localhost:27017",
			"priority" : 2
		},
		{
			"_id" : 1,
			"host" : "localhost:27018",
			"priority" : 1
		}
	]
}
> rs.initiate(config)
```

至此，mongo主从节点模式搭建完毕，可以在两个实例下执行如下命令验证:

```shell
> rs.status()
```

搭建主从，主要是为了用到默认`local`库里的`oplog.rs`。同时随机新建一个库插入几条记录用于后面测试。

```
# 以下是随机测试用的数据
testrs:PRIMARY> use rptest
switched to db rptest
testrs:PRIMARY> show collections
hello
testrs:PRIMARY> db.hello.find()
{ "_id" : ObjectId("59f80e952d3651739ddcbab0"), "Hello" : "World" }
```

## mongo-oplog-backup

### Install

开始测试第一个工具`mongo-oplog-backup`，这里选择用`gem`安装：

```shell
gem install mongo-oplog-backup
# 默认安装到了： ~/.gem/ruby/2.4.0/bin/mongo-oplog-backup
```

### Backup

从默认的`localhost:27017`取出数据并备份到`/tmp/mongotest/oplogtest`

```shell
~/.gem/ruby/2.4.0/bin/mongo-oplog-backup backup --dir /tmp/mongotest/oplogtest
```

执行成功后会看到在制定的备份目录下产生相应的BSON包：

```shell
/tmp/mongotest/oplogtest $ tree ./
./
├── backup-1509429054:1
│   ├── backup.lock
│   ├── dump
│   │   ├── admin
│   │   │   ├── system.version.bson
│   │   │   └── system.version.metadata.json
│   │   ├── debug.log
│   │   ├── error.log
│   │   ├── oplog.bson
│   │   └── rptest
│   │       ├── hello.bson
│   │       └── hello.metadata.json
│   └── state.json
├── backup.json
└── backup.lock

4 directories, 11 files
```

### Restore

回滚就是基于刚刚产生的文件目录，首先用`mongo-oplog-backup`做整合，然后用`mongorestore`恢复：

```shell
# 整合操作
mongo-oplog-backup merge --dir /tmp/mongotest/oplogtest/backup-<timestamp>
```

执行上述命令后，会将所有oplog整合后放到`/tmp/mongotest/oplogtest/backup-<timestamp>/dump/oplog.bson`，最终就是基于这个工具去恢复。

```shell
mongorestore --drop --oplogReplay /tmp/mongotest/oplogtest/backup-<timestamp>/dump/
```

### Setup

建议部署方式是首先进行一次全量备份，然后建立定时任务按时同步。在首次部署完成后，依然需考虑如何对数据进行纠偏，项目官方建议是没隔15分钟就同步一次，每相隔一周就全量同步一次：

```shell
0,15,30,45 * * * * /path/to/ruby/bin/mongo-oplog-backup backup --dir /path/to/backup/location --oplog >> /path/to/backup.log
5 0 * * 1 /path/to/ruby/bin/mongo-oplog-backup backup --dir /path/to/backup/location --full >> /path/to/backup.log
```

使用`mongo-oplog-backup`回滚oplog，并不能做到幂等同步，定期全量回滚一次是必要的。
