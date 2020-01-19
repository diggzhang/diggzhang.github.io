---
layout:     post
title:      "MongoDB去重"
subtitle:   "使用pymongo为mongodb3.X去重"
date:       2016-09-30
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - python
     - pymongo
     - mongodb
---


由于某些原因，我们的MongoDB里存在大批重复数据，甚至已经影响到数据统计。其实在MongoDB 3.2之前可以通过索引直接去重。但这一特性在3.2版本之初已经移除。

```JSON
// 别再用了
{unique : true, dropDups : true} 
```

事已至此，不必难过，自己写脚本去重吧。大概思路是，通过`aggregation`先`group`出重复的键值对并做`count`，之后`match`所有`count>2`的键值对，认为他们是重复的，保留其中一条，删除其余。实现代码如下:



```python
# _*_ coding:utf-8 _*_
from __future__ import print_function
from pymongo import MongoClient
import datetime
import time

db = MongoClient('localhost', 27017)['eventsDB']
events = db['eventCollection']

# 指定时间范围
start = datetime.datetime(2016, 8, 16, 16)
end = datetime.datetime(2016, 8, 23, 16)

def find_dup_key():
    pipeline = [
        # 从指定的时间范围筛选，也可以将这里做成一个分块查询的条件，全表扫描未尝不可，只是内存可能吃不消
        {"$match": {
            "serverTime": {"$gte": start, "$lt": end}
        }},
        # 根据几个字段去判断键值对的唯一性，这里特别写明了{"$exists": True}，必须保证需要判断的字段完成，否则会影响到后面的group
        {"$match": {
            "ek": {"$exists": True},
            "eT": {"$exists": True},
            "location": {"$exists": True},
            "user": {"$exists": True},
            "url": {"$exists": True},
            "serverTime": {"$exists": True},
            "role": {"$exists": True},
            "ua": {"$exists": True}
        }},
        # 将重复的键值对group起来，并用count计数
        {"$group": {
            "_id": {
                "ek": "$ek",
                "location": "$location",
                "user": "$user",
                "role": "$role",
                "url": "$url",
                "ua": "$ua",
                "eT": "$eT",
                "serverTime": "$serverTime",
                "platform" : "$platform",
                "category" : "$category"
            },
            "count": {"$sum":1}
        }},
        # 匹配count大于2的键值对，他们就是重复的
        {"$match": {
            "count": {"$gt": 1}
        }}
    ]
    # 配置allowDiskUse=True应对mongodb的16M limit
    return list(events.aggregate(pipeline, allowDiskUse=True))

# 重复的doc作为list返回，每一组键值对作为find条件去数据库里查询
all_dup_key = find_dup_key()
for dup_event in all_dup_key:
    match_pipe = dup_event['_id']
    remove_id_list = []
    dups = list(events.find(match_pipe))
    if len(dups) >= 2:
        print(len(dups))
        for key in dups:
            remove_id_list.append(key['_id'])
        print(remove_id_list)
        # pop一个出去，作为保留的doc
        needToSave = remove_id_list.pop()
        print(remove_id_list)
        for to_del in remove_id_list:
            events.remove({"_id": to_del})
```

