---
layout:     post
title:      "使用Python实现选择排序"
subtitle:   "Python想必是极好的"
date:       2018-01-09
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - algorithms
---

首先看懂选择排序定义：

> WIKI: 选择排序（Selection sort）是一种简单直观的排序算法。它的工作原理如下。首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置，然后，再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。以此类推，直到所有元素均排序完毕。

必然要经过的一个步骤是在未排序的列表中找到最小(大)的元素。我们构建一个待排序list，代码中叫`waitting_sort_list`。首先实现每次找出最小元素的函数，开始默认最小的元素是index为0的元素，然后用for遍历列表剩余元素逐个对比，只要找到比默认最小元素还要小的，就替换最小元素位置。最后，将最小元素返回。

接下来要实现的是，当获取最小元素后，将最小元素构建到新的队列中，然后将最小元素从最小队列中剔除。最终构建的新队列是有序的队列。

实现代码如下：

```python
def find_smallest_elem_in_list(waitting_sort_list):
    smallest_num = waitting_sort_list[0]
    smallest_index = 0
    for index in range(1, len(waitting_sort_list)):
        if waitting_sort_list[index] < smallest_num:
            smallest_num = waitting_sort_list[index]
            smallest_index = index
    return smallest_index

def selection_sort_list(waitting_sort_list):
    ordered_list = []
    for index in range(len(waitting_sort_list)):
        smallest_index_is = find_smallest_elem_in_list(waitting_sort_list)
        ordered_list.append(waitting_sort_list.pop(smallest_index_is))
    return ordered_list

waitting_sort_list = [12, 12, 234, 56, 61, 2]

print(selection_sort_list(waitting_sort_list))

```
