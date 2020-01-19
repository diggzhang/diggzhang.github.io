---
layout:     post
title:      "Linux清除内存缓存"
subtitle:   "let it free"
date:       2017-03-02
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - Linux
---

我们有一台服务器会被java进程跑满缓存，留记此命令行备用。

```shell
# run as root
# ref: http://unix.stackexchange.com/questions/87908/how-do-you-empty-the-buffers-and-cache-on-a-linux-system
$ free -h && sync && echo 3 > /proc/sys/vm/drop_caches && free -h
```
