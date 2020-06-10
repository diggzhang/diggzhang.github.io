---
layout:     post
title:      "Python中的列表和元组到底有什么区别"
subtitle:   "万年老问题"
date:       2020-05-26
author:     "diggzhang"
tags:
    - python
---

列表和元组都是用于处理集合的。
这俩到底有什么区别，今天我就说透了。

最大区别就是：列表是可变的`mutable`，元组是不可变`inmutable`。举例子说明：

一个list中的元素可以被改变：

```python
>>> mutable_list = [1, 2, 3]
>>> mutable_list[0] = 100
>>> mutable_list
[100, 2, 3]
```

如果想改变一个tuple中的元素就会报错：

```python
>>> inmutable_tuple = (1, 2, 3)
>>> inmutable_tuple[0] = 100
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'tuple' object does not support item assignment
>>>
```

但是tuple可以被重新声明：

```python
>>> a = (1, 2, 3)
>>> a = (4, 5, 6)
>>> a
(4, 5, 6)
```

最大的区别表象是看明白了。
背后的原理是什么？
为什么会这样？这就牵扯到Python的对象管理机制。

列表在创建后会分到一片内存区域。
后续针对列表的操作会直接修改该片内存区域，指针地址不变。

```python
>>> the_list = ["a", "b", "c"]
>>> id(the_list)
4487715152
>>> the_list[0] = "Hello"
>>> id(the_list)
4487715152
>>> the_list
['Hello', 'b', 'c']
```

元组在创建后同样会指明一片内存区域。
不过，当你每一次重新声明变量名的时候，都是开辟新的内存区域。

```python
>>> the_tuple = ("a", "b", "c")
>>> id(the_tuple)
4487792752
>>> the_tuple = ("a", "b", "c")
>>> id(the_tuple)
4487793312
```

所以在运行效率上，同等数据量级，列表肯定相对于元组效率更高一点，因为不用频繁开辟新的内存区域。
列表在初始化时候预先声明好需要的存储空间，后续随着元素增加实时的预开辟新的内存。
在使用安全性上，元组的不可变特性肯定更合适，因为列表都是浅拷贝的，Python都基于引用传递，使用不当可能会导致变量污染。

这里还可以扩展一下，一个不可变的对象还可以用作为Dict中的Key，所以一个元组可以做dict中的key去使用：

```python
>>> this_string = "helloworld"
>>> this_tuple = (1, 2, 3)
>>> thie_list = [1, 2, 3]
>>> {this_tuple: this_string}
{(1, 2, 3): 'helloworld'}
>>> {this_list: this_string}
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'this_list' is not defined
```