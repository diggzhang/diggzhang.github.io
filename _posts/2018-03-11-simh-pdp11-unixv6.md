---
layout:     post
title:      "macOS下用simh模拟pdp11跑unixv6"
subtitle:   "实验楼bash课大搜查"
date:       2018-03-11
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - Linux
     - unix
---

`simh`是一款处理器模拟器，可以用来模拟古老机型`pdp11`，然后在上面跑`unixv6`。这里折腾了一下，想在macOS下跑起来。

主要参考 Installing Unix v6 (PDP-11) on SIMH [gunkies wiki 可以找到](http://gunkies.org/)

这里只记录遇到的坑，人家wiki已经写得很详细了，照着做准成。

macOS下可以使用homebrew安装：

```shell
brew install simh
```

安装完成后不能按照simh文档一样用。需要指明路径，调用`pdp11`模拟器的方法：

```shell
/usr/local/Cellar/simh/3.9-0/bin/pdp11
```

然后就是获得UnixV6的磁带文件，戳此处： [Unix v6 tap](http://sourceforge.net/projects/bsd42/files/Install%20tapes/Research%20Unix/Unix-v6-Ken-Wellsch.tap.bz2/download)。

下载好的tap文件需要rename一下，改名成 **dist.tap**。

最终效果：

```shell
$ /usr/local/Cellar/simh/3.9-0/bin/pdp11 boot.ini

PDP-11 simulator V3.9-0
Disabling XQ
LPT: creating new file
Listening on port 5555 (socket 8)
@unix

login: root
#
# ^E 退出
```

### 参考链接： http://gunkies.org/wiki/Installing_Unix_v6_(PDP-11)_on_SIMH
