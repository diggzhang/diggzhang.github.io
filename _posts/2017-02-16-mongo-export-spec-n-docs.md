---
layout:     post
title:      "MongoDB导出指定行记录"
subtitle:   "mongoexport mongodump双双阵亡"
date:       2017-02-16
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - MongoDB
---

## 需求

最初的需求是，同事希望我导出一组指定条件的埋点，不多不少供给测试，1000条就够了。

```
指定2月3号，后端埋点，1000条
```

乍一看是很简单的一个需求，但是这个时候我才发现`mongodump`和`mongoexport`并不能指定导出多少行记录。

## 折腾

这个时候祭出的组合是: 先`$sample`聚合查出结果存到变量里，然后insert成新表，然后dump。我总觉得应该用mongo的导出工具做这个需求，但是这样做法是目前看来最有效的。

首先打磨一个聚合，用`$sample`抽样1000条，然后将得出结果放到变量`result`里，将这个result记录插入成DB，最后再dump出来就可以了：

```javascript
var result = db.eventV4.aggregate([
    {"$match": {
        "serverTime": {
                "$gte":  ISODate("2017-02-02T16:00:00.000Z"),
                "$lt": ISODate("2017-02-03T16:00:00.000Z")
         },
         "platform": "backend"
    }},
    {"$sample": {"size": 3}}
])

// 存储成为目标DB
db.bar.insert(result.result);

```
