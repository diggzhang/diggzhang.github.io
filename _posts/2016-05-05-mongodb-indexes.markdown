---
layout:     post
title:      "Mongodb索引"
subtitle:   "为常用字段添加索引,加快查询速度"
date:       2016-05-04
author:     "diggzhang"
header-img: "img/in-post/post-mongo-index/mongoDB-logo.png"
category: "MongoDB小司机"
tags:
    - mongodb
---

> This document is not completed and will be updated anytime.


当mongodb单表数据大到一定量级以后,即使是简单的find查询也尤为耗时.这个时候就该考虑为一些常用查询字段建立索引,针对建立索引的字段查询,速度将会明显提升.

一探究竟.

在未建索引的情况下,MongoDB的查询操作必须扫描collection的每条document, 适当的建立索引, 可以在查询时直接检查索引字段读取到数据.索引在mongo内部是一种特殊的数据结构,它会存取数据的一小部分供给查询.这样的存储索引方式其实在其它类型数据库里也大同小异.当数据写入到mongo里,会产生一个位置标志位,在mongo 2.X时代,mmapv1引擎里，位置信息是『文件id + 文件内offset 』组成， 到了MongoDB 3.X时代，在wiredtiger存储引擎（一个KV存储引擎）里，位置信息是wiredtiger在存储文档时生成的一个key，通过这个key能访问到对应的文档。

下图说明了Mongo使用索引查询的基本原理:

![mongo indexes](https://docs.mongodb.org/manual/_images/index-for-sort.png)

MongoDB默认为每条doc的`_id`字段建立唯一索引.同时,mongo也支持多种类型索引,包括单字段索引、复合索引、多key索引、文本索引等，每种类型的索引有不同的使用场合.详情参考[此处](https://docs.mongodb.org/manual/indexes/)

但是建立索引的时候，有个坑——建索引时会导致数据库阻塞,如果集合的数据量很大，建索引通常要花比较长时间，特别容易引起问题。解决的方法很简单，MongoDB 提供了两种建索引的访问，一种是 background 方式，不需要长时间占用写锁，另一种是非 background 方式，需要长时间占用锁。使用 background 方式就可以解决问题。 例如，为超大表建立索引， 千万不用使用

```javascript
db.posts.createIndex({user_id: 1})
```

正确的建立大表索引的方法应该是:

```javascript
db.posts.createIndex({user_id: 1}, {background: 1})
```

稍等，`ensureIndex`和`createIndex`有什么区别？

```
Deprecated since version 3.0.0:
    db.collection.ensureIndex() is now an alias for db.collection.createIndex().
```
