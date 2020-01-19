---
layout:     post
title:      "线上阿里云MongoDB实时同步到线下"
subtitle:   "人有多大胆，数据多大产"
date:       2016-12-20
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: MongoDB
tags:
     - MongoDB
     - 阿里云
---

## Update20171101

同时可以参考[《MongoDB增量备份工具测评》](http://yangcongchufang.com/mongodb小司机/mongodb-incremental-backup-tools-test.html)。

## WHY

我们的分析场景里，愈发依赖从线上实时获得数据。需要从线上的阿里云MongoDB服务实时同步数据到线下分析服务器里的MongoDB。但是`Ali-MongoDB`默认并不提供直接外网连接访问。

无论是怎样的线上到线下实时同步，至少得先让线下可以直接访问到线下。

## WHAT

阿里云官方文档《[通过公网连接云数据库 MongoDB--ECS Linux 篇](https://help.aliyun.com/knowledge_detail/39952.html)》推荐使用了`rinetd`工具作为中间流量转发工具实现线下可以直接访问`Ali-MongoDB`

> 目前云数据库 MongoDB 是需要通过 ECS 的内网进行连接访问，如果本地需要通过公网访问云数据库 MongoDB，可以在 ECS Linux 云服务器中安装 rinetd 进行转发实现。

## HOW

### Step.1 install rinetd

```shell
$ wget http://www.boutell.com/rinetd/http/rinetd.tar.gz && tar -xvf rinetd.tar.gz && cd rinetd
$ sed -i 's/65536/65535/g' rinetd.c (修改端口范围)
$ mkdir /usr/man && make && make install
```

### Step.2 rinetd configure

rinetd的配置文件默认从`/etc/rinetd.conf`获取，如下给出一个文件配置示例，将mongo的3717端口映射到了ecs的3717：

```shell
$ cat /etc/rinetd.conf

# bindadress bindport connectaddress connectport
0.0.0.0 3717 xxxxxxxxxxxxxxxxxxxxx.mongodb.rds.aliyuncs.com 3717
logfile /var/log/rinetd.log
```

### Step.3 let it run

完成配置后，使用`sudo`权限启动`rinetd`:

```shell
$ sudo rinetd

$ ps aux | grep rinetd
master   20140  0.0  0.0  13096   920 pts/9    S    12:04   0:00 ./rinetd
```

到这一步，大功告成，可以使用线下的机器直接访问到ECS映射的MongoDB：

```shell
mongo --host hostMongo.aliyunECS.com:3717 -u spec_username -p spec_password --authenticationDatabase admin
```

## SYNC

目前至少保证了线下的主机可以直接访问到阿里云的云Mongo。接下来就是考虑同步方式的问题。目前能想到的同步方式有两种：`以最后一条文档为标记为同步` 和 `用MongoDB的oplog进行同步`。

接下来的调研将围绕这两种办法的可行性去找办法。

- 第一个以最后一条文档为标记为同步，每同步一次，圈定一个范围，以时间为范围同步或者以`_id`为标志位同步。能预估的可能会做的工作是，写一个脚本定时跑一次，每跑一次记录一个恢复点。下一次同步的基于前一次恢复点滚动着同步。这样做的缺点就是，一些`update`的东西没法同步好，只能算是增量。

- 第二个办法是用MongoDB本身产生的`oplog`同步。首先得先了解`oplog`到底是什么鬼。`oplog`可以说是`Mongodb Replication`的纽带。当`Primary`进行写操作的时候，会将这些写操作记录写入Primary的Oplog中，而后Secondary会将Oplog复制到本机并应用这些操作，从而实现`Replication`的功能。同时由于其记录了Primary上的写操作，故还能将其用作数据恢复。（要是能把线下作为一个`Replication`就好了）

## TOOLS

目前能搜到的工具有如下：

- [mongo-sync](https://github.com/sheharyarn/mongo-sync)(shell/最后一次更新5个月前)

这款工具文档和使用都很友好。底层还是基于`mongodump/mongorestore`，直接是`--drop`覆盖方式同步整个指定的`DB`。只需要在`config.yml`里配置一下就可以上手。想实际跑起来还需修改一下代码中`mongodump/mongorestore`的部分指定auth db。

```shell
mongodump \
    -h "$remote_host_url":"$remote_host_port" \
    ......
    --authenticationDatabase admin \
    -o "$TMPDIR" > /dev/null
success_msg
```

很好用，但是不符合我们的需求，并不是增量方式同步。不过代码写的很精简，如果最终需要定制的话，可以基于这个项目开始。

扩展优化的思路是和以文档为标记的思路一样，想办法在每次dump的时候指定一个`--queryFile`的`json`文件，这个json文件存储每次dump的范围(这里可以考虑引入sqlite去存一些源信息)，restore的时候以追加方式入本地库。

- [py-mongo-sync](https://github.com/caosiyang/py-mongo-sync)(python/最后一次更新18天前)

README写的很诱人，是基于`oplog`的同步的工具，关键是作者还在更新：

> A oplog based realtime sync tool for MongoDB written in Python. Source should be a member of replica set and destination could be a mongod/mongos instance or member of replica set.

调整代码里`mongo_helper`的超时时间长一些，否则会报错`time out`，用法如下：

```
$ python main.py --from remotemongo.com:3717 --src-username yourusername --src-password yourpassword --to localhost:27017 --db yourdbname --coll yourcollectionname
```

踩了一些坑本以为要成了，结果报出了一个错，经查究，原因是阿里云云数据库MongoDB不支持这个命令`replSetGetStatus`，阿里云对于命令的限制可以[参考这里](https://help.aliyun.com/knowledge_detail/39953.html)：

```
pymongo.errors.OperationFailure: command {'replSetGetStatus': 1} on namespace admin.$cmd failed: no such command: 'replSetGetStatus', bad cmd: '{ replSetGetStatus: 1 }'
```

源码中这部分的作用是从`primary`节点获得`optime`。`optime`在`MongoDB 3.2`中有更动，作者在源码中留下注释:

```
"""
Get optime of primary in the replica set.

Changed in version 3.2.
If using protocolVersion: 1, optime returns a document that contains:
    - ts, the Timestamp of the last operation applied to this member of the replica set from the oplog.
    - t, the term in which the last applied operation was originally generated on the primary.
If using protocolVersion: 0, optime returns the Timestamp of the last operation applied to this member of the replica set from the oplog.

Refer to https://docs.mongodb.com/manual/reference/command/replSetGetStatus/
"""
```

在源码中，这部分的作用是判读`MongoDB`集群中的members的`optime`，拿`optime`其实是想拿到集群成员中各个节点的最后一个操作的时间信息。该工具是用`optime`作为标志位依据。

- [mongo-oplogreplay](https://github.com/uberVU/mongo-oplogreplay)(python/最后一次更新3年前)

这个工具更多的是关于 **replay** 的实现，之后如果希望自己写回放`oplog`可以参考一下代码。并不是一个解决需求的银弹，暂不深入。

- [mongo-oplog / node-mongo-oplog](https://github.com/MiguelSavignano/node-mongo-oplog/)(js/最后一次更新1年前)

基于`node.js`的`oplog`监控工具，并不符合需求。但是基础工具`mongo-oplog`却引人注意。回顾目标：

1. 定时将目标机的oplog表或业务表拿下来同步，所谓同步的底层还是借用mongodump/mongorestore
2. 远程连接到目标机器的`oplog`，实时监听，实时回放。

第二种方案可以借助`mongo-oplog`实现一把，测试代码在下面。

原理大概是：

1. `rinetd`将待同步的线上库映射出去，保证线下可以访问
2. [mongo-oplog](https://github.com/cayasso/mongo-oplog)连线上库监听oplog
3. 依据oplog增删改查线下库
4. 简言之：监听->同步

```javascript
"use strict";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const MongoOplog = require("mongo-oplog");
const oplog = MongoOplog(
    // 指定rinetd映射出来的Mongo
    // 必须指定 authSource=admin
    'mongodb://spec_username:spec_password@link.to.mongo.ecs.aliyun.demo.cn:3434124/local?authSource=admin',
    // 指定希望同步的库.表
    { ns: 'test.posts' }
);

// localhost mongo
const mongoUrl = 'mongodb://localhost:27017/syncFromOnline';

MongoClient.connect(mongoUrl, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to local server");

  oplog.tail();

  // 监听到`insert`事件的回调里调用本地mongo把oplog里的`o`字段插入到本地目标库
  oplog.on('insert', doc => {
    console.log(doc);

    // Insert a document
    db.collection('httplogs_sync').insertOne(doc.o, function(err, r) {
      assert.equal(null, err);
      assert.equal(1, r.insertedCount);

      db.close();
    });

  });

});
```

## PROJECT

基于上面的思想，我试着完成了一个同步线上阿里云到线下的工具[ali-mongo-sync](https://github.com/diggzhang/ali-mongo-sync)。
具体设计思路和环境部署方法都写`README`里了。
