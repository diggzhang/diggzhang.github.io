---
layout:     post
title:      "Python中看字典中元素是否存在"
subtitle:   "dict magic"
date:       2017-01-05
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
---

## 需求背景

有时候我们需要从`MongoDB`中load一堆无结构的文档parse成`dict`，比如我们有下面三组结构不一致的文档：

```python
In [1]: doc_a
Out[1]: {'eventKey': 'enterHome', 'u_name': 'diggzhang', 'u_os': 'Android'}

# 相较于其他两组文档多了一个`platform`字段
In [2]: doc_b
Out[2]: {'eventKey': 'haltApp', 'platform': 'web', 'u_name': 'max', 'u_os': 'Android'}

In [3]: doc_c
Out[3]: {'eventKey': 'stopVideo', 'u_name': 'master', 'u_os': 'Mac'}
```

这个时候，如果我们想查找值或者检查某些键是否存在(比如你可能会关心`MongoDB`中到底有多少种键)，由于文档结构可能比较麻烦。比如我们想找找`platform`是否在这组文档中存在,最简单直观的办法肯定是遍历然后if判断，但是量级如果太大这样很明显行不通：

```python
# 冷笑话版本
if 'platform' in doc_a:
    print("platform exists!")

if 'platform' in doc_b:
    print("platform exists!")

if 'platform' in doc_c:
    print("platform exists!")
```

## 最佳实践

优雅的解决办法是借用`collections`解决，`ChainMap`类可以将多个dict融合成一个dict去使用：

```python
>>> from collections import ChainMap
>>> doc_a = {'eventKey': 'enterHome', 'u_name': 'diggzhang', 'u_os': 'Android'} >>> doc_b = {'eventKey': 'haltApp', 'platform': 'web', 'u_name': 'max', 'u_os': 'Android'}
>>> doc_c = {'eventKey': 'stopVideo', 'u_name': 'master', 'u_os': 'Mac'}
>>>
>>> doc_chain = ChainMap(doc_a, doc_b, doc_c)
>>> doc_chain
ChainMap({'u_name': 'diggzhang', 'u_os': 'Android', 'eventKey': 'enterHome'}, {'platform': 'web', 'u_name': 'max', 'u_os': 'Android', 'eventKey': 'haltApp'}, {'u_name': 'master', 'u_os': 'Mac', 'eventKey': 'stopVideo'})
```

`ChainMap`类完成融合后产生的`doc_chain`，可以当做一个真正的`dict`使用。如果出现融合的dict里有重复键，那么第一次出现的映射值会被返回。因此,例子程序中的返回的是字典中`doc_a`对应的值,而不是`doc_b`中对应的值。

```python
>>> print(doc_chain['platform'])
web
>>> print(doc_chain['eventKey'])
enterHome
>>>
```

也可以使用下面的办法计算中到底在该组`ChainMap`中到底有多少种`key`：

```python
>>> doc_chain.keys()
KeysView(ChainMap({'u_name': 'diggzhang', 'u_os': 'Android', 'eventKey': 'enterHome'}, {'platform': 'web', 'u_name': 'max', 'u_os': 'Android', 'eventKey': 'haltApp'}, {'u_name': 'master', 'u_os': 'Mac', 'eventKey': 'stopVideo'}))
>>> list(doc_chain.keys())
['platform', 'u_name', 'eventKey', 'u_os']
```

承接上面来个变种测试，我想知道`ChainMap`对有深层结构的`dict`会识别成怎样：

```python
>>> doc_c # 修改doc_c中的某个字段，让他是嵌套的dict
{'u_name': 'master', 'u_os': {'version': 23.2, 'os': 'mac'}, 'eventKey': 'stopVideo'}
>>> doc_chain = ChainMap(doc_a, doc_b, doc_c)
>>> list(doc_chain.keys())
['platform', 'u_name', 'eventKey', 'u_os']
```

结果有些失望，猜想可能是跟重复键的处理规则一样是最左优先，于是我将`doc_a`变成了深层结构，最终出的list结果还是一样，可见`ChainMap`对于深层结构的处理不是这样的玩法。
