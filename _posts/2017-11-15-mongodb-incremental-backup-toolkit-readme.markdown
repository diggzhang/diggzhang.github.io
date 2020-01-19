---
layout:     post
title:      "MongoDB实现增量备份或实时备份"
subtitle:   "自建mongodb增量备份工具"
date:       2017-11-15
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: "MongoDB小司机"
tags:
    - mongodb
---

## 项目缘起

- [线上阿里云MongoDB实时同步到线下](http://yangcongchufang.com/mongodb/ali-mongo-sync-online-to-offline.html)
- [MongoDB增量备份工具测评](http://yangcongchufang.com/mongodb%E5%B0%8F%E5%8F%B8%E6%9C%BA/mongodb-incremental-backup-tools-test.htm)

## 部署

依据需求部署三个python文件为crontab计划任务:

```
$ crontab -e
# add this job
1 */1 * * * /bin/bash /path/to/mongo-oplog-sync/run.sh >> /tmp/mongo_sync.log 2>&1
```

```
$ chmod +x run.sh
$ cat run.sh
export PATH=~/.pyenv/shims:~/.pyenv/bin:"$PATH"
cd /home/master/Scripts/mongo-oplog-sync
echo ">>> Oplog "`date`
python mongooplog_scroll.py >> /tmp/mongo_sync.log
echo ">>> Dump"`date`
python mongodump_scroll.py >> /tmp/mongo_sync.log
echo ">>> Restore"`date`
python mongorestore_scroll.py >> /tmp/mongo_sync.log
echo ">>> Done"`date`
```

## 注意事项

首次使用最好做一次完整的dump并加`--oplog`参数，并手工填一条"切割记录"(后面解释)。

## 代码地址

三个python文件，[Github链接](https://github.com/diggzhang/mongo-oplog-sync-toolkit):

- `mongooplog_scroll.py`
- `mongodump_scroll.py`
- `mongorestore_scroll.py`

## 业务逻辑

线上购买使用的阿里云MongoDB服务是一个三节点的分片集群，分片之间依靠oplog日志数据同步，我们就是依赖这个特性，节点中插一脚，异步的方式将从节点的oplog拉取下来回放，以期得到增量效果。

打开`local`库下的`oplog.rs`表，可以看到oplog的数据结构，看懂数据结构就可以明白集群直接同步是在做什么了：

```javascript
{
    "_id" : ObjectId("5a0f06b8682ff3e357323950"),
    "ts" : Timestamp(6488781305977765, 3),
    "t" : NumberLong(2),
    "h" : NumberLong(2516577600968573900),
    "v" : 2,
    "op" : "u",
    "ns" : "db_name.db_collection_name",
    "o2" : {
        "_id" : ObjectId("59fdc3e3eea911064c499845")
    },
    "o" : {
        "$set" : {
            "modifyTime" : ISODate("2017-11-15T23:05:28.097Z"),
            "anydatafiled" : 760
        }
    }
}
```

挨个解释关键部分：

- `ts` 可以理解是数据库操作发生时间
- `h` 数据操作的唯一id
- `ns` 指明了数据库和表
- `op` 里的值代表操作类型，举例：i(insert)/u(update)/d(delete)，示例中的u就代表这条oplog将会更新一条已经存在的数据，具体要更新什么表什么字段呢，就`o`和`o2`
- `o` 代表了要操作的内容，示例中将会针对`o2._id`的文档做update用`$set`操作符更新了两个字段
- `o2` 其实只有在`op:u`的时候才出现，查找的目标字段是一个ObjectId

对关键字段有个粗略认知，大概也能猜出oplog回放到底是做了什么了，根据不同op，依然使用mongo本身的算子操作数据。

程序分三个部分+一个公共日志，日志切割、数据dump、数据restore解耦，可以依据日志看数据回滚情况。

- 日志切割： 程序部署成计划任务后，定期读取线上环境的mongo，以ts为准切割形成“数据块” (`opStart`, `opEnd`)
- 数据dump： oplog切割成块后，按序dump到不同目录(`isDump`)
- 数据restore: 读取oplog做回滚操作(`isRestore`)

```javascript
{
    "_id" : ObjectId("5a0a63a73fc87d61fad345f2"),
    "opStart" : {
        "t" : "1510629525",
        "i" : "15"
    },
    "opEnd" : {
        "t" : "1510630125",
        "i" : "20"
    },
    "isRestore" : true,
    "isDump" : true,
    "syncTime" : ISODate("2017-11-14T11:27:21.146Z"),
    "syncFrom" : "oos-xxxxxxxxxxxxxxxxxxxx.mongodb.rds.aliyuncs.com"
}
```

为什么设计成三个部分？日志切割可以拆分oplog同时按时间点记录一个范围，将这个范围确定好并存档，可以借此实现一种类似“断点续传”的感觉，即使因为极端原因（断电断网地球停转）整个程序挂掉，只要保证日志切割好，提供后面的dump程序，提供一个查询范围即可。三个程序都依赖一个日志结构去做，切割失败就不会产生切割日志，dump或restore失败就全标记为false，重启程序自己回滚。


## 缺陷

仔细思考如此设计的缺陷，会很头疼第一次同步的问题。首次启动程序前应该有一个全量dump并加oplog回滚，待回滚完成后手工去记录最后的日志点，填一条日志到同步控制的记录中，手工写ts值。

同时数据滞后问题也会存在：数据会一直滞后于业务库。导致的结果是没有办法做量级上的精确比对，如果希望做count比对，需要业务配合做停顿。

数据准确性验证只能在业务特定文档做删改，然后在同步周期结束后现在查相同文档比对。


这里有个粗略的量级验证办法，在某个日志切割的时机，在线上环境对业务库做count产生对比值A,然后在线下oplog回放完成后，对相应的业务库做count产生对比值B，然后用AB就可以得出大概的同步效果，给个评判。

然后每次全量同步的时候，需要在dump前记录最后一条oplog日志的时间节点，暂称dumpTs。dumpTs将作为全量恢复之后，第一次增量的开始ts。

## 下一步

- 数据长期比对效果
- 检查数据准确性抽样比对

## Update20180404

- 上线`2755`个小时，线上线下对比零误差，oplog做增量还是很靠谱的。
