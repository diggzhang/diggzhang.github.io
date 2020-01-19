---
layout:     post
title:      "JsonParseException Illegal character恼人的线上bug"
subtitle:   "解决一个恼人bug"
date:       2019-02-26
author:     "diggzhang"
tags:
    - scala
---

在某个线上restful服务中，突然有天开始受到奇奇怪怪的乱码错误。举个例子，长这样：

```shell
2019-02-13 at 14:53:48 CST ERROR com.onion.eventreceiver.App$ 206 logAppender - invalid json format,json parse error! com.fasterxml.jackson.core.JsonParseException: Illegal character ((CTRL-CHAR, code 31)): only regular white space (\r, \n, \t) is allowed between tokens
 at [Source: ��������M��n� �_��������\T�$R�VU���0��D6���RU}�N6�;����0��oe��Tw��:Iz�-��:T�E�)�E}>#�,���Y�n�9i�aA��tX]i��n&-BR\<���'7#hg  Rr���j�𩖒Mu��}+�ZsCI��*ű�x�p����6L4l�`aƈ�P�vu�����\���!�XɆ�N۰%��({��'3�躾�0��kbX�Yʛ�w���ɾ\���lޅ��� 9�����=��\���x�-,�k����VH�^������0.��=@!3����'g���
�~
���L�
AHKS��x���%
���P��0]��Z1�%-���+s���H�d���WN)iT+{����`�"�k��; line: 1, column: 2]
    at com.fasterxml.jackson.core.JsonParser._constructError(JsonParser.java:1487) ~[eventreceiver-0.0.1-SNAPSHOT-allinone.jar:?]
```

这里报出的核心错误是：

```shell
com.fasterxml.jackson.core.JsonParseException: Illegal character ((CTRL-CHAR, code 31)): only regular white space (\r, \n, \t) is allowed between tokens
```

粗看就是在json parse过程中发生了错误。但是究竟是因何而起，百思不得其解。这里先说一下解析Json部分的逻辑：

```
判断是否是gzip压缩的消息  --Y-- 解压 --Y-- Parse成Json --Y-- 解构后存储
                                 --N-- 解压失败
                       --N-- Parse成Json --Y-- 解构后存储
```


问题就是出在header如果没有指明的情况下，发送一个经过gzip压缩的请求，会被判断为非压缩的消息直接进入parse模块中处理。

解决办法也非常简单，就是在发送gzip请求时候，需要指明header信息:

```shell
'content-encoding': 'gzip'
```

但是我同时在后端也加了如果没有指明header，先判断能否parse，如果不能parse，尝试gzip解压后再parse。