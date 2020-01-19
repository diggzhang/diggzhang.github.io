---
layout:     post
title:      "Hello,BSON"
subtitle:   "BSON是MongoDB主要的数据存储结构"
date:       2016-05-06
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
    - bson
    - mongodb
---

**BSON** 是MongoDB存储文档的数据结构，在网络传输过程中也是利用bson交互。是一种类JSON的文档描述格式，简称Binary JSON。

BSON有四种数据基础类型:

```
byte	1 byte (8-bits)
int32	4 bytes (32-bit signed integer, two's complement)
int64	8 bytes (64-bit signed integer, two's complement)
double	8 bytes (64-bit IEEE 754-2008 binary floating point)
```

在处理document过程中，会按照BSON结构处理doc为以下结构形式，具体细节参看[这里](http://bsonspec.org/spec.html):

```java

[4]byte(length) + byte(element.type) + []byte(element.key) + byte(0) + []byte(element.value) + byte(0)

//example
data = {"a":{"a":1}}
Println(bson.Marshal(data)) // out  [20 0 0 0 3 97 0 12 0 0 0 16 97 0 1 0 0 0 0 0]
```

在处理MongoDB数据过程中，对于较小的数据量级，可以考虑直接读取mongodump产生的BSON文件。

[python-bson-streaming](https://github.com/bauman/python-bson-streaming)可以直接读取BSON RAW。

使用办法:

```python
from bsonstream import KeyValueBSONInput
from sys import argv
import gzip

for file in argv[1:]:
    f=None
    if "gz" not in file:
        f = open(file, 'rb')
    else:
        f=gzip.open(file,'rb')
    stream = KeyValueBSONInput(fh=f,  fast_string_prematch="github")
for dict_data in stream:
    ...process dict_data...
```

另外有一种便捷快速的方案，参考：

https://stackoverflow.com/questions/27527982/read-bson-file-in-python
