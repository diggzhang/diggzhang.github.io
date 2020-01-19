---
layout:     post
title:      "Python获取列表中的最大和最小"
subtitle:   "Python查找最大或最小的N个元素"
date:       2017-06-28
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - python_cookbook
---

阅读《Python Cookbook》体验到了不一样的Python，坚持一日一读一练。

## 问题

在处理一批无序数据集合的时候，希望获得其中的最大的几个或最小的几个。日常做法可能是先将整个序列`sort(<list>)`，然后切片摘取，但其实当排序小于列表长度的情况下，更合适的做法是使用`heapq`模块。

## 解决方案
`heapq`模块有两个函数：`nlargest()`和`nsmallest()`可以实现这个需求。

```python
>>> import heapq
>>> nums = [6, 23, -19, 88, 100, 1]
>>> print(heapq.nlargest(3, nums))
[100, 88, 23]
>>> print(heapq.nsmallest(3, nums))
[-19, 1, 6]
```
heapq特性在数组字典中一样管用，当希望对数组字典排序的时候，不需要再写个冗杂的`for`循环:

```python
>>> stu_score_info = [
...     {'name': 'zhang', 'score': 70},
...     {'name': 'wang', 'score': 80},
...     {'name': 'li', 'score': 90},
...     {'name': 'zhao', 'score': 100},
...     {'name': 'max', 'score': 112}
... ]
>>> last_3 = heapq.nsmallest(3, stu_score_info, key = lambda stu: stu['score'])
>>> last_3
[{'score': 70, 'name': 'zhang'}, {'score': 80, 'name': 'wang'}, {'score': 90, 'name': 'li'}]
>>> top_3 = heapq.nlargest(3, stu_score_info, key = lambda stu: stu['score'])
>>> top_3
[{'score': 112, 'name': 'max'}, {'score': 100, 'name': 'zhao'}, {'score': 90, 'name': 'li'}]
>>> # li 的位置很稳定 2333
```

## More about heapq

heapq的底层实现是堆排序，堆数据结构的特征是`heap[0]`永远是最小的元素。

```python
>>> import heapq
>>> nums
[6, 23, -19, 88, 100, 1]

>>> heapq.heapify(nums)
>>> nums
[-19, 23, 1, 88, 100, 6]
```

使用`heapq.heappop()`可以将第一个（最小）的元素弹出来，对比`min()`在时间复杂度上仅仅是`O(log N)`:

```python
#找出nums列表最小的3个元素
>>> heapq.heappop(nums)
-19
>>> heapq.heappop(nums)
1
>>> heapq.heappop(nums)
6
```

当希望查找的元素相较于列表较小的时候，使用heapq或许很合适。但当列表大小和排序大小几乎相同长度的时候，最快的还是排序切片（`sorted(<list>)[:N]  sorted(<list>)[-N:]`）。
