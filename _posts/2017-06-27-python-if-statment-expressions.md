---
layout:     post
title:      "Python过滤列表元素/列表推导式"
subtitle:   "python_cookbook trick"
date:       2017-06-30
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - python_cookbook
---

最近生病一直泡在医院，环境嘈杂，心乱如麻，好在排队等挂号的时间可以做些什么，于是一直在反思自己的工作、生活以及代码。真正开始反思以后，跳出工作的氛围，可以看透很多东西，跳出圈子然后引导自己思考。

Python是可以写得很优雅的，我在自己代码中过量用if条件去做了很多脏活。写太多if并不符合python简单的哲学，替换if的最佳方式是使用条件表达式，改写一个if语句举例子:

```python
if x > 0:
    y = 'hello'
else:
    y = 'world'
```

转成条件表达式:

```python
y = 'hello' if x > 0 else 'world'
```

实际执行效果:

```python

In [0]: x = 9

In [1]: y = 'hello' if x > 0 else 'world'

In [2]: y
Out[2]: 'hello'

In [3]: x = -9

In [4]: y = 'hello' if x > 0 else 'world'

In [5]: y
Out[5]: 'world'
```

在用if作流程控制的时候，更pythonic的做法是写成条件表达式的模式，除了精简程序结构以外，从阅读感上也比纯if...else的堆砌好。

在递归函数的处理上，也可以使用这种办法简写:

```python
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)
```

改装:

```python
def factorial(n):
    return 1 if n == 0 else return n * factorial(n-1)
```

改装后在逻辑表达上没有任何问题，还更加精炼。

这里需要反思一下，颇有心得，即使是最基础的if语句，也有优雅起来的办法。未来我在处理自己if代码的时候，会尽可能优先使用if条件表达式，追求代码精炼。
