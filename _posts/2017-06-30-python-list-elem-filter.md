---
layout:     post
title:      "Python列表推导以及过滤"
subtitle:   "python_cookbook tricks"
date:       2017-07-03
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - python_cookbook
---

阅读《Python Cookbook》体验到了不一样的Python，坚持一日一读一练。

## 问题

对于Python最常用的数据结构类型`list`，我们经常会想利用一些规则从中list中提取出需要的值(过滤)或缩短`list`序列(提取)。如果过滤，想当然办法是`for...in...`遍历重组的方式，但逼格做法是列表推导，是的，**列表推导**。

## 解决方案

先用最简单的实例感受一下列表推导，在示例中将遍历和判断包到`[]`中，最终直接返回`list`，一气呵成:

```python

In [1]: mylist = [1, 4, -5, 10, -7, 2, 3, -1, 0]

In [2]: [n for n in mylist if n > 0]
Out[2]: [1, 4, 10, 2, 3]

In [3]: [n for n in mylist if n < 0]
Out[3]: [-5, -7, -1]

```

但列表推导的list如果太大的话，将会消耗内存，对于超大list进行推导，可以使用生成器表达式迭代产生过滤的元素:

```python

In [4]: pos = (n for n in mylist if n > 0)

In [5]: pos
Out[5]: <generator object <genexpr> at 0x1017235a0>

In [6]: for x in pos:
   ...:     print(x)
   ...:
1
4
10
2
3

```


## filter()

前面的列表推导示例都是最简单的过滤判断，当希望有更为复杂的过滤条件引入推导，比如处理异常或其它复杂情况，解决方法是使用`filter()`函数：

```python
# 首选我们构建一个存在字符数字和普通字符的list序列
# 我们希望用一个过滤函数将所有字符数字过滤出来

In [8]: values = ['1', '2', '-3', '-', '4', 'N/A', '5']

In [9]: def is_int(val):
   ...:     try:
   ...:         x = int(val)
   ...:         return True
   ...:     except ValueError:
   ...:         return False
   ...:

In [10]: ivals = list(filter(is_int, values))

In [11]: print(ivals)
['1', '2', '-3', '4', '5']

```

`filter()`执行后，创建了一个迭代器，所以用`list()`包一下获取列表结果。

## 列表推导中过滤和替换

列表推导通常也会用于在遍历同时转换数据：

```python

In [1]: mylist = [1, 4, -5, 10, -7, 2, 3, -1]

In [2]: import math

In [3]: [math.sqrt(n) for n in mylist if n > 0]
Out[3]: [1.0, 2.0, 3.1622776601683795, 1.4142135623730951, 1.7320508075688772]

```

同时也可以用于在遍历过程中完成元素替换：

```python
In [7]: clip_neg = [n if n > 0 else 0 for n in mylist]

In [8]: clip_neg
Out[8]: [1, 4, 0, 10, 0, 2, 3, 0]
```

## itertools.compress()

试想一个应用场景，当有一张用户表，和一张数学成绩表，我们希望关联并对比打印出数学成绩大于80分的同学，这个时候该怎么办？使用过滤工具`itertools.compress()`可以很好的解决。

伪造一个用户表信息`students`，对应一张成绩表信息`score`:

```python
In [13]: students
Out[13]: ['max', 'zhang', 'diggzh', 'nerd', 'foo', 'bar']

In [15]: score
Out[15]: [70, 80, 80, 90, 60, 55]
```

现在大于等于80分的同学打印出来：

```python
In [23]: from itertools import compress

In [24]: best = [n > 80 for n in score]

In [25]: best
Out[25]: [False, True, True, True, False, False]

In [28]: list(compress(students, best))
Out[28]: ['zhang', 'diggzh', 'nerd']
```

`compress()`传入了students的list，以及列表推导产出的布尔队列，布尔队列里为True的将被返回。
