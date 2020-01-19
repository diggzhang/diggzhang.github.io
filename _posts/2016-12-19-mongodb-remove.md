---
layout:     post
title:      "关于MongoDB的remove操作"
subtitle:   "你以为你以为的就是你以为的？"
date:       2016-12-19
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: MongoDB
tags:
     - MongoDB
---

# 发生了什么

在Mongo里我们有一批数据需要回滚，时间范围大概是半个月，从11月23日到12月3日。

我要做的是，先从线上清洗出想回滚的数据，然后restore到本地。听着很简单，但细想步骤应该是：

1. 准备该时间段待回放数据，全量
2. 清除本地该时间段的所有数据，防止重复写入
3. mongorestore

# 过程

第二步的清楚，我想当然的使用`remove`，但又一次细想，应该先判断影响范围就先做了`count`:

```javascript
db.eventV4.count({
    "serverTime": {
        "$gte": ISODate("2016-11-23T16:00:00.000Z"),
        "$lt":  ISODate("2016-12-07T16:00:00.000Z")
    },
    "platform": "backend"
})

// 返回
// 55556666
```

接下来以为万事大吉，就直接`remove`了。于是漫长的等待了很久，我都以为任务失败了。

```javascript
db.eventV4.remove({
    "serverTime": {
        "$gte": ISODate("2016-11-23T16:00:00.000Z"),
        "$lt":  ISODate("2016-12-07T16:00:00.000Z")
    },
    "platform": "backend"
})
```

为了判断任务还在执行，使用`db.currentOp()`看了一下，不看不知道一看吓一跳，任务确实在执行，但是`remove`的过程并不是在读索引的，注意下面`"numYields" : 19117`， **MongoDB的remove正在逐行扫描符合条件的document!** 这尼玛不行，这得猴年马月啊。

```javascript
> db.currentOp()
{
	"inprog" : [
		{
			"desc" : "conn1276",
			"threadId" : "139693360576256",
			"connectionId" : 1276,
			"client" : "10.8.8.xxx:38778",
			"active" : true,
			"opid" : 2991212,
			"secs_running" : 123040,
			"microsecs_running" : NumberLong(140525868),
			"op" : "remove",
			"ns" : "eventsV4.eventV4",
			"query" : {
				"platform" : "backend",
				"serverTime" : {
					"$gte" : ISODate("2016-11-23T16:00:00Z"),
					"$lt" : ISODate("2016-12-07T16:00:00Z")
				}
			},
			"numYields" : 19117,
			"locks" : {
				"Global" : "w",
				"Database" : "w",
				"Collection" : "w"
			},
			"waitingForLock" : false,
			"lockStats" : {
				"Global" : {
					"acquireCount" : {
						"r" : NumberLong(19118),
						"w" : NumberLong(19118)
					}
				},
				"Database" : {
					"acquireCount" : {
						"w" : NumberLong(19118)
					}
				},
				"Collection" : {
					"acquireCount" : {
						"w" : NumberLong(19118)
					}
				}
			}
		},
		{
			"desc" : "conn1289",
			"threadId" : "139693367944960",
			"connectionId" : 1289,
			"client" : "127.0.0.1:54221",
			"active" : true,
			"opid" : 2991889,
			"secs_running" : 0,
			"microsecs_running" : NumberLong(198),
			"op" : "command",
			"ns" : "admin.$cmd",
			"query" : {
				"currentOp" : 1
			},
			"numYields" : 0,
			"locks" : {

			},
			"waitingForLock" : false,
			"lockStats" : {

			}
		}
	],
	"ok" : 1
}
>
```

# 挽救

觉得不能等了，人生苦短，直接上`pymongo`吧。于是我写了一个Python脚本，按天给mongo提交任务，这样最起码能心里有数，打几行log最起码可以起到心里安慰作用：

```python
# -*- coding: utf-8 -*-
import sys
import pymongo
from pymongo import MongoClient
from datetime import datetime
import datetime
from datetime import date

db_host = MongoClient("10.8.8.xxx", 27017)
db_events_v4 = db_host["eventsV4"]
collections_eventV4 = db_events_v4['eventV4']

class get_collection_start_end_count(object):
    def __init__(self, arg):
        self.collecion_instance = arg

    def count_docs(self, start, end):
        collecion = self.collecion_instance
        return collecion.count({
            "serverTime": {
                "$gte": start,
                "$lt": end
            },
            "platform": "backend"
        })

    def remove_docs(self, start, end):
        collecion = self.collecion_instance
        return collecion.delete_many({
            "serverTime": {
                "$gte": start,
                "$lt": end
            },
            "platform": "backend"
        })

print("### 创建数据库实例")
eventV4_Instance = get_collection_start_end_count(collections_eventV4)

print("### 创建时间范围")
base_date = datetime.datetime(2016, 11, 22, 16)
date_nums = 15
date_list = [base_date + datetime.timedelta(days=x) for x in range(0, date_nums)]

for this_day in date_list:
    start_date = this_day
    end_date = this_day + datetime.timedelta(days=1)
    # count = eventV4_Instance.count_docs(start_date, end_date)
    # print start_date.strftime("%Y%m%d"),":" ,count
    removed = eventV4_Instance.remove_docs(start_date, end_date)
    print start_date.strftime("%Y%m%d"),":",removed.deleted_count
```

# 事实

最终，执行脚本后发现了一个有意思的地方，log如下：

```
➜  ~ python countBackendEvents.py
### 创建数据库实例
### 创建时间范围
20161122 : 2096187
20161123 : 0
20161124 : 0
20161125 : 0
20161126 : 0
20161127 : 1849129
......
```

`remove`是顺利执行了，但`remove`并没有按时间顺序实行。面对大量`documents`的时候，`remove`并不是按照理想样子执行。

# 细思极恐

如果万一有一天，更大量级的文本需要去回滚，我该怎么办。

[how to cleanup a huge mongodb collection ?](http://jayant7k.blogspot.com/2013/03/how-to-cleanup-huge-mongodb-collection.html)

这篇2013年的博客给了启发。mongodb希望remove超大量级文档的时候，大概原理是：

1. 决心要删
2. `db.col1.find( { ts : { $gt : ISODate("2012-09-27T00:00:00.000Z")  } } ).forEach( function(c){db.col2.insert(c)} )` 有索引的find当然更快，结合insert把需要保留的数据放到其他地方。
3. `db.col1.rename("dirty_col1")` 重命名脏表。
4. `db.dirty_col1.drop()` 把脏表干掉。
