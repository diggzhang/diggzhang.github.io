---
layout:     post
title:      "Python中以周为单位生成时间范围"
subtitle:   "datetime"
date:       2017-01-22
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - MongoDB
---

## 需求背景

我需要从`MongoDB`中，以周为单位dump几组数据。想着该如何批量生成一组时间，拼接成dump用的json。

## 折腾

搜了好多办法，最终决定还是利用`datetime.timedelta`自己简单的实现这个小工具：

```python
def time_range_gen(start, end):
    time_range = []
    while start < end:
        this_date_range_dict = {}
        this_date_range_dict["start"] = start
        start = start + datetime.timedelta(days=7)
        this_date_range_dict["end"] = start
        time_range.append(this_date_range_dict)
    return time_range

start = datetime.datetime(2016, 9, 11, 16)
end = datetime.datetime(2017, 1, 22, 16)

for time_range in time_range_gen(start, end):
    print time_range
```
