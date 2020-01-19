---
layout:     post
title:      "Bash查缺补漏"
subtitle:   "实验楼bash课大搜查"
date:       2017-11-22
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - Linux
     - shell
---

日常虽然经常用到shell脚本，但是基本都是拼凑功能，然后粗暴测试。遇到bug时候，粗暴执行看效果已经不足以解决复杂问题，需要学习调试bash shell解决痛点。

## 定义日志输出级别

日志是调试信息的重要依赖，通过重新封装echo定制日志级别，可以优化脚本输出。

创建一个`log_level.sh`脚本，体验一把：

```shell
#!/bin/bash -v

_loglevel=2

DIE() {
  echo "Critical: $1" >&2
  exit 1
}

INFO(){
  [ $_loglevel -ge 2 ] && echo "INFO: $1" >&2
}

ERROR(){
  [ $_loglevel -ge 1 ] && echo -e "\033[31m ERROR:\033[0m $1" >&2
}

INFO "this is an info level log"
ERROR "this is an error level log"
DIE "code exit 1"
```

## set x

`set -x`可以将将要执行的shell脚本命令行打印出来，在shell执行过程中，可以将整个流程打印出来，看到到底执行了什么命令，跑了哪些参数。

具体用法，基于上面的脚本文件，在调用前后加参数`set -x`，`set +x`:

```shell
set -x
INFO "this is an info level log"
set +x
ERROR "this is an error level log"
DIE "code exit 1"
```

set前后包裹的范围，就是整个调试区域的信息。

```shell
+ INFO 'this is an info level log'
+ '[' 2 -ge 2 ']'
+ echo 'INFO: this is an info level log'
INFO: this is an info level log
+ set +x
ERROR: this is an error level log
Critical: code exit 1
```

如果想针对整个脚本看`xtrace`,可以这样做：

```shell
sh -x ./log_level.sh
```

## trap

直接新建一个`trap_test.sh`体验一下：

```shell
#!/bin/bash
trap "echo this is a exit echo" EXIT
echo "run this first"
```

脚本执行效果：

```shell
$ sh traps.sh
run this first
this is a exit echo
```

`trap`命令收到的是`EXIT`信号，代表在脚本执行到结束时，执行trap参数里的echo命令。
