---
layout:     post
title:      "Python中转换字符串为时间类型"
subtitle:   "python_cookbook tricks"
date:       2017-06-29
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - python_cookbook
---

阅读《Python Cookbook》体验到了不一样的Python，坚持一日一读一练。

## 问题

当获取数据源后，经常会遇到字符串类型的时间表示形式，python的datetime库提供将字符串转换为时间类型的方法。

## 解决方案

使用`datetime`的`strptime`实现：

```python
>>> from datetime import datetime
>>> text = '2017-06-29'
>>> convert_to_datetime = datetime.strptime(text, '%Y-%m-%d')
>>> now = datetime.now()
>>> diff = now - convert_to_datetime
>>> diff
datetime.timedelta(0, 34299, 56279)
```

`strptime`支持多种格式化字符成为时间的转义符，比如讲时间转为易读形式：

```python
>>> now
datetime.datetime(2017, 6, 29, 9, 31, 39, 56279)
>>> stringify = datetime.strftime(now, '%A %B %d %Y')
>>> stringify
'Thursday June 29 2017'
```

## More about datetime.strptime

`Cookbook`中提出`strptime`因为转换日期时候必须处理系统本地的设置，所以会存在性能问题。在遇到批量数据处理的时候，如果时间格式已经确定，最好使用自定义函数去处理，这里举个例子:

```python
>>> from datetime import datetime
>>> text = '2017-06-29'
>>> def parse_ymd(s):
...     year, mon, day = s.split('-')
...     return datetime(int(year), int(mon), int(day))
...
>>> parse_ymd(text)
datetime.datetime(2017, 6, 29, 0, 0)
```


## 实际例子

ISODate的日期形式比较诡异：

```javascript
"params" : {
    "endTime" : "2018-07-15T15:59:59.999Z",
    "startTime" : "2018-05-04T16:00:00.000Z",
    "classId" : "132a8012-2da0-11e8-9ec4-376c0342128a"
},
```

加入希望提取`end - start`计算间隔多久，精确到毫秒，需要先将时间作为字符处理：

```python
start = datetime.strptime(params['startTime'].split('T')[0], '%Y-%m-%d')
end = datetime.strptime(params['endTime'].split('T')[0], '%Y-%m-%d')
```

然后根据`total_seconds() * 1000`得出毫秒级时间：

```python
(end - start).total_seconds() *    1000
```

## 参考链接：

- [Python: Difference between two datetimes in milliseconds
](http://markhneedham.com/blog/2015/07/28/python-difference-between-two-datetimes-in-milliseconds/)
