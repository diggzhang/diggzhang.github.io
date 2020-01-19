---
layout:     post
title:      "Python解析ini文件"
subtitle:   ""
date:       2017-08-11
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - python_cookbook
---

## 问题

在日常中经常遇到`*.ini`的文件，wiki中解释名字出自Initial，总之，一般遇到这种东西寓意就是初始化配置文件。

拿到这样的一个纯文本配置解析里面的配置内容岂不很懵逼吗？

```
[installation]
lib=openssl-devel
bin=/usr/local/bin/python

[debug]
log_errors=true

[server]
host: yangcongchufang.com
port: 8081
root=/www/root
banner:
  ======================
  yangcongchufang
  ======================
```

## 解决

想不到并不懵逼，有专门解析这种文件的库。将上面的配置存成`config.ini`做个小试验：

```shell
./
└── config.ini
└── parser.py
```

解析用到的库叫`configparser`:

```python
>>> from configparser import ConfigParser
>>> cfg = ConfigParser()
# 创建实例预读config.ini文件
>>> cfg.read('config.ini')
['config.ini']

# 可以看出已经读出了每个j段落
>>> cfg.sections()
[u'installation', u'debug', u'server']

# 将installation下面的lib拿出来
>>> cfg.get('installation', 'lib')
u'openssl-devel'

# 读取一个布尔值
>>> cfg.getboolean('debug', 'log_errors')
True

# 读取一个整型值
>>> cfg.getint('server', 'port')
8081

# 输出bnner
>>> print(cfg.get('server','banner'))

======================
yangcongchufang
======================
```

不仅仅可以读，还可以修改配置：

```
>>> cfg.set('server', 'port', '9999')
>>> cfg.set('debug', 'log_errors', 'False')
>>> import sys
>>> cfg.write(sys.stdout)
[installation]
lib = openssl-devel
bin = /usr/local/bin/python

[debug]
log_errors = False

[server]
host = yangcongchufang.com
port = 9999
root = /www/root
banner =
	======================
	yangcongchufang
	======================

>>>
```

ini文件的应用场景集中于Windows操作系统中，感觉具体用哪类型配置文件方式，适配就好。这里有一篇纠结的[讨论](https://github.com/versionpress/versionpress/issues/914)，蛮有意思的。
