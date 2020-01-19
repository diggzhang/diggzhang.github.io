---
layout:     post
title:      "一篇文章踩遍Python中的坑"
subtitle:   "你真的懂Python吗"
date:       2016-11-22
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: 高级Python编程基础
tags:
     - python
     - 编程理论
---

### 类与列表生成器

下面的代码会报错，为什么？

```python
In [1]: class A(object):
   ...:     x = 1
   ...:     gen = (x for _ in xrange(10))
   ...:

In [2]: if __name__ == "__main__":
   ...:     print(list(A.gen))
   ...:
---------------------------------------------------------------------------
NameError                                 Traceback (most recent call last)
<ipython-input-2-bb15a85da3e4> in <module>()
      1 if __name__ == "__main__":
----> 2     print(list(A.gen))
      3

<ipython-input-1-45646dbd84a7> in <genexpr>((_,))
      1 class A(object):
      2     x = 1
----> 3     gen = (x for _ in xrange(10))
      4

NameError: global name 'x' is not defined
```

这个问题是变量作用域问题，在`gen=(x for _ in xrange(10))`中`gen`是一个`generator`,在`generator`中变量有自己的一套作用域，与其余作用域空间相互隔离。因此，将会出现这样的 `NameError: name 'x' is not defined`的问题，那么解决方案是什么呢？答案是：用`lambda `。

```python
In [7]: class A(object):
   ...:     x = 1
   ...:     gen = (lambda x: (x for _ in xrange(10)))(x)
   ...:

In [9]: if __name__ == "__main__":
    print(list(A.gen))
   ...:
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
```

### 装饰器

我想写一个类装饰器用来度量函数/方法运行时间

```python
In [10]: import time

In [11]: class Timeit(object):
   ....:     def __init__(self, func):
   ....:         self._wrapped = func
   ....:     def __call__(self, *args, **kws):
   ....:         start_time = time.time()
   ....:         result = self._wrapped(*args, **kws)
   ....:         print("elapsed time is %s ")%(time.time() - start_time)
   ....:         return result
   ....:
# 这个装饰器能够运行在普通函数上：
In [12]: @Timeit
   ....: def func():
   ....:     time.sleep(2)
   ....:     return "invoking function func"
   ....:

In [13]: if __name__ == "__main__":
   ....:     func()
   ....:

elapsed time is 2.00392723083
```

但是运行在方法上会报错，为什么？

```python
In [14]: class A(object):
   ....:     @Timeit
   ....:     def func(self):
   ....:         time.sleep(1)
   ....:         return "invoking method func"
   ....:

In [15]: if __name__ == "__main__":
   ....:     a = A()
   ....:     a.func()
   ....:
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-15-eb4fb185288b> in <module>()
      1 if __name__ == "__main__":
      2     a = A()
----> 3     a.func()
      4

<ipython-input-11-aedd3f23516b> in __call__(self, *args, **kws)
      4     def __call__(self, *args, **kws):
      5         start_time = time.time()
----> 6         result = self._wrapped(*args, **kws)
      7         print("elapsed time is %s ")%(time.time() - start_time)
      8         return result

TypeError: func() takes exactly 1 argument (0 given)
```

如果我坚持使用类装饰器，应该如何修改？

使用类装饰器后，在调用 `func` 函数的过程中其对应的 `instance` 并不会传递给 `__call__` 方法，造成其 `mehtod unbound` ,那么解决方法是什么呢？描述符赛高:

```python
In [16]: class Timeit(object):
   ....:     def __init__(self, func):
   ....:         self.func = func
   ....:     def __call__(self, *args, **kwargs):
   ....:         print("invoking Timer")
   ....:     def __get__(self, instance, owner):
   ....:         return lambda *args, **kwargs: self.func(instance, *args, **kwargs)
   ....:

In [17]: class A(object):
   ....:     @Timeit
   ....:     def func(self):
   ....:         time.sleep(1)
   ....:         return "invoking method func"
   ....:

In [18]: if __name__ == "__main__":
   ....:     a = A()
   ....:     a.func()
   ....:
```

### Python调用机制

我们知道 `__call__` 方法可以用来重载圆括号调用，好的，以为问题就这么简单？**Naive！**

```python
In [19]: class A(object):
   ....:     def __call__(self):
   ....:         print("invoking __call__ from A!")
   ....:

In [20]: if __name__ == "__main__":
   ....:     a = A()
   ....:     a()
   ....:
invoking __call__ from A!
```

现在我们可以看到`a()`似乎等价于`a.__call__()`,看起来很 Easy 对吧，好的，我现在想作死，又写出了如下的代码，

```python
In [21]: a.__call__ = lambda: "invoking __call__ from lambda"

In [22]: a.__call__()
Out[22]: 'invoking __call__ from lambda'

In [23]: a()
invoking __call__ from A!
```

请大佬们解释下，为什么`a()`没有调用出`a.__call__()`(此题由 USTC 王子博前辈提出)

原因在于，在 Python 中，新式类（ new class )的内建特殊方法，和实例的属性字典是相互隔离的，具体可以看看 Python 官方文档对于这一情况的说明

> For new-style classes, implicit invocations of special methods are only guaranteed to work correctly if defined on an object’s type, not in the object’s instance dictionary. That behaviour is the reason why the following code raises an exception (unlike the equivalent example with old-style classes):

同时官方也给出了一个例子：

```python
In [24]: class C(object):
   ....:     pass
   ....:

In [25]: c = C()

In [26]: c.__len__ = lambda: 5

In [27]: len(c)
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-27-c6494b964a51> in <module>()
----> 1 len(c)

TypeError: object of type 'C' has no len()

In [28]: c.__len__
Out[28]: <function __main__.<lambda>>

In [29]: c.__len__()
Out[29]: 5
```

回到我们的例子上来，当我们在执行 `a.__call__=lambda:"invoking __call__ from lambda" `时，的确在我们在 `a.__dict__ `中新增加了一个 `key` 为 `__call__` 的 `item`，但是当我们执行 `a()` 时，因为涉及特殊方法的调用，因此我们的调用过程不会从 `a.__dict__` 中寻找属性，而是从 `type(a).__dict__` 中寻找属性。因此，就会出现如上所述的情况。


*TODO 日后有坑，查漏补缺*
