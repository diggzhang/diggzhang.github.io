---
layout:     post
title:      "Python Pretty Json Print In Terminal"
subtitle:   "python tricks"
date:       2017-06-30
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
---


## 问题

不知道你是否有格式化输出json到终端的需求，遇到脏乱的数据将其格式化输出可以提高可读性。

## 解决方案

在终端格式化输出JSON的方法:

```shell
$ echo '{"hello":"world"}' | python -mjson.tool | pygmentize -l json
{
    "hello": "world"
}
```

