---
layout:     post
title:      "Python解压序列赋值多个变量"
subtitle:   "python_cookbook tricks"
date:       2017-07-04
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - python_cookbook
---

阅读《Python Cookbook》体验到了不一样的Python，坚持一日一读一练。

## 问题

`Cookbook`第一章讨论的是数据结构和算法，给出对于python中的列表、集合以及字典的一些常用算法。

第一个问题是，当我们得到一个多个元素的元组或列表，如何将里面的值解压同时赋值给N个对应的变量？

## 解决方案

> 任何的序列或者是可迭代对象可以通过一个简单的赋值语句解压并赋值给多个变量。唯一的前提就是变量的数量必须跟序列元素的数量是一样的。

```python
>>> p = (4, 5)
>>> x, y = p
>>> x
4
>>> y
5

>>> data = ['acme', 50, 91.1, (2017,7,4)]
>>> name, shares, price, date = data
>>> print(name, shares, price)
acme 50 91.1
>>> date
(2017, 7, 4)
```

顺手举反例：

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

解压赋值不仅仅针对于列表和元组，还可以用到任何可迭代的对象上面：

```python
>>> str = "Hello"
>>> a, b, c, d, e = str
>>> a
'H'
>>> c
'l'
>>> e
'o'
```

有时候我们希望解压一部分的值，择取希望得到的部分，丢弃无用的地方，python这里没有提供特殊的方法，但解决思路是放一个任意占位的变量：

```python
>>> data
['acme', 50, 91.1, (2017, 7, 4)]
>>> name, _, _, date = data
>>> name
'acme'
>>> date
(2017, 7, 4)

```
