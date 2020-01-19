---
layout:     post
title:      "MongoDB count 数据量不一致问题"
subtitle:   "Robomongo count bug"
date:       2017-02-16
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - MongoDB
     - Robomongo
---

## 20170228 UPDATE

细读官方文档发现如下一段，[链接](https://docs.mongodb.com/manual/reference/command/count/)：

> After an unclean shutdown of a mongod using the Wired Tiger storage engine, count statistics reported by count may be inaccurate.

先说结果： **我们认为mongodb count是不准确的。**

在实际生产环境中，针对一个表直接`count`的结果，和使用`aggregate`计算得出的结果不一致。但因为聚合是通过扫描+计算得出，我们认为聚合更准确。此外，我们也尝试将mongo表直接映射到hive表上面，通过hive count的值和mongo聚合得出结果一致。

```javascript
//mongo count
db.collection.count()  // 得出结果 4831488

// 自己改写count成聚合
db.collection.aggregate([
    {"$group": {
        "_id": null,
        "count": {"$sum": 1}
    }}
]) //得出结果 {“_id”: null, "count": 4831764.0}
```

让mongo count不准确的原因，可能是mongo异常shutdown，最好异常关闭后`validate`一下，参考链接：

- https://docs.mongodb.com/manual/reference/command/validate/#dbcmd.validate
- https://docs.mongodb.com/manual/reference/program/mongod/#cmdoption-syncdelay

## 20170220 UPDATE

*Update:* 发现`mongoshell`中也存在`count`同范围数据出不同结果的情况，但多次`count`后会趋向于一个值，这个值跟`dump`出的条目数吻合。

-----

我们一直使用`Robomongo`作为mongo客户端工具，用得顺手，写聚合高亮，各种特性加一起基本是绝配。

然额，最近发现这样一件事情，当我试图对一组量级较大历史数据多次`count`后发现得出不同结果。

```javascript
// 检索语句
db.getCollection('eventV4').count({
    // 时间范围以`ISODate()`过滤
    "serverTime" : {
        "$gte": ISODate("2017-02-03T16:00:00.000Z"),
        "$lt": ISODate("2017-02-04T16:00:00.000Z"),
    },
    // 筛选了一类型字段
    "platform": {"$ne": "backend"}
})
```

在`Robomongo`多次检索出的结果居然发现不同:

|id|result|
|:--:|:--:|
|第1次|17182684|
|第2次|18143412|
|第3次|18143412|
|第4次|17182684|

`WHAT THE FUCK!!!???`这是忽略物理世界客观规律的错误吗？于是我开始尝试`mongodump/restore`将相同条件的数据从数据源取下来在另一个mongo实例里做统计，最终得出结果:

|id|result|
|:--:|:--:|
|第1次|17182684|
|第2次|17182684|
|第3次|17182684|
|第4次|17182684|

> count() is equivalent to the db.collection.find(query).count() construct.

开始思考到底是`count()`条件导致，还是`count()`函数本身有问题，于是也尝试了`find({}).count()`，还是得出相同结果，但是一旦回到数据源去count，便会偶然得出不同结果。开始怀疑是否因为`cursor + 数据量太大`导致。但是这个时候我无意打开了`MongoChef`，于是用另一款mongo客户端工具测试了数据源count，发现几次测试结果竟然一致。于是我开始对比`mongodump/mongoshell/robomongo/mongochef`的结果：

|mongodump/restore|mongoshell|robomongo|mongochef|
|:--:|:--:|:--:|:--:|
|17182684|17182684|17182684|17182684|
|17182684|17182684|18143412|17182684|
|17182684|17182684|18143412|17182684|
|17182684|17182684|17182684|17182684|

真相只有一个，`robomongo`不知道为什么撒了谎。

这让我回想起曾经遇到过这样的情况，在`robomongo`中两个count结果突然聚到一页上[Ref: Double count give double result on second View #1146](https://github.com/paralect/robomongo/issues/1146)。

还有如果集合太大，[Scripts end prematurely and randomly when using loop #1106](https://github.com/paralect/robomongo/issues/1106)。

反思这个事情，如果日后需要精确的数据量级统计，还是用`mongoshell`比较好，毕竟`robomongo`可能会因为软件自身带来一些影响统计结果的问题。
