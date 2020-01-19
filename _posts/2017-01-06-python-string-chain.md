---
layout:     post
title:      "Python中字符串连接问题"
subtitle:   "++++++++++++++++++++++++++++++"
date:       2017-01-06
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
---

## 需求背景

起先我是想造出一串连接的字符串用来做输出行与行之间的区分:

```shell
echo [*] +++++++++++++++++++++++++++++++++++++++++++++++++
echo [*] -------------------------------------------------
```

其实完全可以在`python`中直接`print("+++++")`这样一组字符，但考虑到会多次使用这样的print函数，其实可以封装成一个函数。

这是一个字符串连接问题。

## 最佳折腾实践

```python
def echo_split_line(symbol, iter_range):
    """
        symbol <string> Repeatedly displayed characters
        iter_range <number> Length of displayed characters
    """
    symbol_list = []
    for value in range(1,iter_range):
        symbol_list.append(symbol)
    return ''.join(symbol_list)
```

函数中先将将要展现的字符按照指定长度填充成一个`list`(`['+','+','+']`)，然后再用`''.join`拼接整个数组。

这样一来就完成了一个可定制的模块化的字符串拼接组件（~~卧槽说的好牛逼~~）。

```python
In [0]: echo_split_line('$',30)
Out[0]: '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$'

In [0]: echo_split_line('@',50)
Out[0]: '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'

In [0]: print("echo [*] %s")%(echo_split_line("+",30))
echo [*] +++++++++++++++++++++++++++++
```

## 最佳实践

实际上`python`已经提供了字符串填充套装`ljust`/`rjust`/`center`，用法简洁明了。

```python
In [0]: text = "echo [*] "
In [0]: text.ljust(30, '+')
Out[0]: 'echo [*] +++++++++++++++++++++'


In [0]: text = " who am i "
In [0]: text.center(30, '+')
Out[0]: '++++++++++ who am i ++++++++++'
```

人家字符串方法都已经自带了，借力用力重新改造一下这个`输出日志分割字符串函数`：

```python
In [1]: %paste
def echo_split_line_by_lrjust(split_string, direction, iter_range, symbol):
    """
        split_string <STRING> part of custom print string
        direction <STRING> alignment direction
        iter_range <NUMBER> length of displayed characters
        symbol <STRING> repeatedly displayed characters
    """
    return_string = {
        "l": split_string.ljust(iter_range, symbol),
        "r": split_string.rjust(iter_range, symbol),
        "c": split_string.center(iter_range, symbol)
    }
    return return_string.get(direction)

## -- End pasted text --

In [2]: echo_split_line_by_lrjust("echo [*] ", "l", 30, "*")
Out[2]: 'echo [*] *********************'

In [3]: echo_split_line_by_lrjust(" END", "r", 30, ">")
Out[3]: '>>>>>>>>>>>>>>>>>>>>>>>>>> END'

In [4]: echo_split_line_by_lrjust(" MAIN ", "c", 30, "*")
Out[4]: '************ MAIN ************'
```

实际使用中写字符太麻烦了，`"c"/"l"/"r"`，替换成`0/1/2`。

```python
def echo_split_line_by_lrjust(split_string, direction, iter_range, symbol):
    direction_map = {
        0: "c",
        1: "l",
        2: "r"
    }
    return_string = {
        "l": split_string.ljust(iter_range, symbol),
        "r": split_string.rjust(iter_range, symbol),
        "c": split_string.center(iter_range, symbol)
    }
    return return_string.get(direction_map.get(direction))

echo_split_line_by_lrjust(" MAIN ", 0, 30, "*")
# '************ MAIN ************'

echo_split_line_by_lrjust(" MAIN ", 1, 30, "*")
# ' MAIN ************************'

echo_split_line_by_lrjust(" MAIN ", 2, 30, "*")
# '************************ MAIN '
```
