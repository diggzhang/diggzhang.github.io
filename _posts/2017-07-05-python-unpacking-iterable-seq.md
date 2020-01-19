---
layout:     post
title:      "Python解压可迭代序列赋值多个变量"
subtitle:   "python_cookbook tricks"
date:       2017-07-07
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - python_cookbook
---

阅读《Python Cookbook》体验到了不一样的Python，坚持一日一读一练。

## 问题

当我们得到一个多个元素的元组或列表，试图将里面的N个值解压同时赋值给N个对应的变量，如果解压对象和对应变量不对等，会出现一种问题`ValueError: too many values to unpack`:

```python
>>> arg3 = (11, 22, 33)
>>> x, y = arg3
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ValueError: too many values to unpack (expected 2)
>>> x, y, z, k = arg3
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  ValueError: too many values to unpack (expected 2)
>>> x, y, z = arg3
```

有时候我们确实不可能精确知道，待处理的序列中到底有多少个元素，但希望去除个别值，完成赋值操作，这个时候该怎么办？

## 解决方案

即刻召唤`*`号表达式完成需求，假如某项比赛评委打出分，去掉最高分和最低分：

```python
>>> def get_mid_score(scores):
...     scores.sort()
...     lower, *middle, high = scores
...     return middle
...
>>> score_list = [79, 88, 89, 11, 10]
>>>
>>> get_mid_score(score_list)
[11, 79, 88]
```

靠着`*`表达式的思路，我们顺着摸索可以操作一个序列方法：

```python
>>> record = ('diggzhang', 'dig@g.com', '139122','34211')
>>> name, email, *phone_nums = record
>>> phone_nums
['139122', '34211']
```

下面讨论一种迭代序列时候的高级用法，试想这样的应用场景，我们获取了一个不确定的序列，针对序列内的不同情况走不同的函数传值去处理，如下，算法精简直白：

```python
>>> records = [
...     ('foo', 1, 2),
...     ('bar', 'hello'),
...     ('foo', 3, 4)
... ]
>>> def do_foo(x, y):
...     print('fooo', x, y)
...
>>> def do_bar(s):
...     print('bar', s)
...
>>> for tag, *args in records:
...     if tag == 'foo':
...             do_foo(*args)
...     elif tag == 'bar':
...             do_bar(*args)
...
fooo 1 2
bar hello
fooo 3 4
>>>
```

`*`表达式还可以同时应用于字符串分割：

```python
>>> line = '_coremediaiod:*:236:236:Core Media IO Daemon:/var/empty:/usr/bin/false'
>>> user, *fields, homedir, sh = line.split(':')
>>> user
'_coremediaiod'
>>> homedir
'/var/empty'
>>> sh
'/usr/bin/false'
>>>
```
