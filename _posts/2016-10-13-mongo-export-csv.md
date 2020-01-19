---
layout:     post
title:      "使用MongoDB导出CSV"
subtitle:   "NO, NO mongoexport"
date:       2016-10-13
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - mongodb
---

#### mongoexport

```shell
# 直接从某个表导出期望字段，生成CSV
mongoexport --host 10.8.8.xxx --db sampleData --collection eventV4 --csv --out events.csv --fields '_id,something'

# 增加一个检索filter后导出CSV
mongoexport --host 10.8.8.xxx --db sampleData --collection eventV4 --queryFile ./range.json --csv --out events.csv --fields '_id,something'

# cat range.json
{"something":{"$gt":1}}
```

有的时候，我们需要从mongo中导出特定的几个字段的数据保存CSV文件供分析用。虽然已经有`mongoexport`，但如果遇到一些层级较深的字段，肯定还是手写代码比较方便。

#### 构建查询语句

假设我们需要从`events collection`抽取三个字段`user/time/videoname`，find语句会这么写

```javascript
db.events.find({},{"user": 1, "time": 1, "videoname": 1})
```

稍加修改，存档成一个js文件:

```javascript
// queryUsers.js
db.events.find({},{"user": 1, "time": 1, "videoname": 1}).forEach(
    function(doc) {
        print(doc.user + "," + doc.serverTime + "," + doc.videoName)
    }
)
```

#### mongo执行需求

之后用`mongo`执行后面的需求

```shell
mongo events queryUsers.js > whatuWant.csv

mongo <数据库名> <检索语句文件> > <导出文件>.csv
```

[参考链接](http://stackoverflow.com/questions/14478304/redirect-output-of-mongo-query-to-a-csv-file)
