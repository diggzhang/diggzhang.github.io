---
layout:     post
title:      "Python中的字符串搜索"
subtitle:   "python_cookbook tricks"
date:       2017-07-25
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
    - python
    - python_cookbook
---

阅读《Python Cookbook》体验到了不一样的Python，坚持一日一读一练。

## 问题

匹配或搜索特性模式的文本。

## 解决方案

如果只是想在字符串中查出特定字符，只需要调用字符方法即可：`str.startswith() / str.endswith() / str.endswith() `等。

```python
In [1]: text = "yeah, but no, but yeah, but no, but yeah"
# Exact match
In [2]: text == 'yeah'
Out[2]: False

# Match at start or end
In [3]: text.startswith('yeah')
Out[3]: True
In [4]: text.endswith('no')
Out[4]: False

# Search for location of first occurrence
In [5]: text.find('no')
Out[5]: 10
```

如何希望比之复杂的字符串提取和匹配，最好还是使用`re`模块：

```python
In [6]: import re

In [7]: text1 = '25/7/2017'

In [8]: text2 = 'Nov 25, 2017'

In [9]: if re.match(r'\d+/\d+/\d+', text1):
   ...:     print('yes')
   ...: else:
   ...:     print('no')
   ...:
yes
```

`re.match()`里的正则表达式`\d+`代表匹配一个或多个数字。`r'\d+/\d+/\d+'`代表试图匹配出`数字/数字/数字`类似于`text1`这种形式。将该表达式匹配给text2就会返回no:

```python
In [10]: if re.match(r'\d+/\d+/\d+', text2):
   ....:     print('yes')
   ....: else:
   ....:     print('no')
   ....:
no
```

为了匹配一个`r'\d+/\d+/\d+'`这样的模式，我们写了两次重复代码，其实为了将一个模式运用用多次匹配，应该先将模式字符串预编译为模式对象。

```python
In [11]: datePattern = re.compile(r'\d+/\d+/\d+')

In [12]: if datePattern.match(text1):
   ....:     print('yes')
   ....: else:
   ....:     print('no')
   ....:
yes

In [13]: if datePattern.match(text2):
   ....:     print('yes')
   ....: else:
   ....:     print('no')
   ....:
no
```

`match()`会从字符串最开始自左向右匹配，发现第一个匹配规则后立即返回，如果想对整个字符串分析取出所有符合规则的字符串，则需要祭出`findall()`:

```python
In [14]: text = '今天是25/7/2017. 明天是26/7/2017.'

In [15]: datePattern.findall(text)
Out[15]: ['25/7/2017', '26/7/2017']
```

我们的正则已经具备从字符串中提取出日期的模式，如果想从日期中提出月和日呢？需要改写一个`datePattern`：

```python
In [16]: datePattern
Out[16]: re.compile(r'\d+/\d+/\d+')

# 重写`datePattern`为其\d+补上一个括号
In [17]: datePattern = re.compile(r'(\d+)/(\d+)/(\d+)')

# 开始测试
In [18]: pickUp = datePattern.match('25/7/2017')

In [19]: pickUp.group(0)
Out[19]: '25/7/2017'

In [20]: pickUp.group(1)
Out[20]: '25'

In [21]: pickUp.group(2)
Out[21]: '7'

In [22]: pickUp.group(3)
Out[22]: '2017'

In [25]: pickUp.groups()
Out[25]: ('25', '7', '2017')

In [27]: month, day, year = pickUp.groups()

In [29]: print(text)
今天是25/7/2017. 明天是26/7/2017.

In [30]: datePattern.findall(text)
Out[30]: [('25', '7', '2017'), ('26', '7', '2017')]

In [31]: for month,day,year in datePattern.findall(text):
   ....:     print('{}-{}-{}'.format(year, month, day))
   ....:
2017-25-7
2017-26-7

```

`findall()`方法会搜索文本并以列表形式返回所有的匹配。如果你想以迭代方式返会所有匹配结果，使用`finditer()`:

```python
In [32]: for m in datePattern.finditer(text):
   ....:     print(m.groups())
   ....:
('25', '7', '2017')
('26', '7', '2017')
```

到此为止，对于复杂字符串搜索，就是使用正则，一般使用正则的流程就是：`re.compile()先编一个正则式，然后match()/findall()...做查找，然后就是groups()提出来`。
