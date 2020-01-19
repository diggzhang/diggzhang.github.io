---
layout:     post
title:      "关于Python与switch case"
subtitle:   "寻找更好的编程模式"
date:       2016-05-04
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
    - python
---

> This document is not completed and will be updated anytime.

Python的设计哲学是“简单”，和其它语言不太一样的地方之一是：**没有switch case语句**。

带来的问题是，当我们遇到多条件判断的时候只能用if去判断，一堆if，一堆丑代码，这和“简单”的设计哲学相悖。

```python
    if somthing == 'left':
        if somthing == 'right':
            if somthing == 'middle':
                ...
```

事实上有更好的编程模式去避开这种看着胸口疼的代码 —— 表驱动法。

当需要多次逻辑判断的时候，应该考虑构建条件映射去解决switch类似的结构:

```python
def vip_process():
    print("call vip")

def package_process():
    print("call package")

def littleClass_process():
    print("call little class")

def out_of_case():
    print("out of case")

def distribution_discriminator(kind):
    discriminator_kind = {
        'vip': vip_process,
        'package': package_process,
        'littleClass': littleClass_process,
    }
    return discriminator_kind.get(kind, out_of_case)()

distribution_discriminator("vip")
distribution_discriminator("package")
distribution_discriminator("littleClass")
distribution_discriminator("one_mock_faied_data")
```

上面的写法等价于switch语句:

```c
function(argument){
    switch(argument) {
        case 0:
            return "zero";
        case 1:
            return "one";
        case 2:
            return "two";
        default:
            return "nothing";
    };
};
```

在遇到多条件判断的时候，`pythonic`的做法是将通过各种逻辑语句去判断的条件，构建成映射表，这样的做法可以使代码更加结构化，也易于调试bug。
