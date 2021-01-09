---
layout:     post
title:      "使用Python生成自然周时间序列"
subtitle:   "偶然要用到"
date:       2021-01-09
author:     "diggzhang"
tags:
    - python
---

## 问题

处理批量ETL任务时候，经常需要按周去回滚数据。
这时候就需要按周去生成一个时间范围的序列,将序列里的开始和结束时间作为入参传给ETL代码。
下面提供一种自然周时间序列生成的方法：

## 解决 


```python
import datetime as dt
import time
import json


def gen_week_range():
    weekend_index = (6, 5)  # Sunday, Saturday
    requested_range = (dt.datetime(2019, 4, 14, 0, 0), dt.datetime(2021, 1, 1, 0, 0))

    start, end = requested_range
    sun, sat = weekend_index
    cur = start
    my_range = []

    while cur < end:
            cr = []
            cr.append(cur)
            cur = end if end < cur+dt.timedelta(days=6) else (cur+dt.timedelta(days=(sun if cur.weekday() == sun else (sat-cur.weekday()))))
            cr.append(cur)
            cur += dt.timedelta(days=1)
            my_range.append(cr)
    return my_range

date_list = gen_week_range()
```
