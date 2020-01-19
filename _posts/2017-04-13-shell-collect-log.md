---
layout:     post
title:      "shell中日志输出的最佳实践"
subtitle:   ""
date:       2017-04-13
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - shell
---

## 需求

最初的需求是我希望在cron里部署一个脚本，并输出日志到一个tmp文件存根。在调试的时候我想知道脚本当前的执行状态，一直tail看输出其实挺不爽的。

这个更“master”一些的做法是，执行shell脚本的时候`+x`。但确实会有同时输出日志到多处的这种需求，这个时候最佳办法就是写一个专门的日志print函数。

## 实践

[Ref: (stackoverflow) How to output text to both screen and log file](http://unix.stackexchange.com/questions/80707/how-to-output-text-to-both-screen-and-file-inside-a-shell-script)

下面的`echolog()`函数就是一个专门的日志输出工具，使用这种方法可以模块化的实现日志分离输出。

```shell
#!/usr/bin/env bash

DB_NAME_EVENTS="eventV4" && \
DB_COLLECITON_NAME="eventV4" && \

YEAR=$(date -d -1day '+%Y') && \
MONTH=$(date -d -1day '+%m') && \
DAY=$(date -d -1day '+%d') && \

LOGFILE=/tmp/renameCollectionEventV4EveryMonth_"$YEAR$MONTH".log && \

echolog()
(
    echo "$1"
    echo "$1" >> "$LOGFILE"
)

echolog "code start $(date)"
echolog "*************************************"
echolog "*                                   *"
echolog "*                                   *"
echolog "*************************************"

echolog "$DB_NAME_EVENTS: $DB_COLLECITON_NAME: $YEAR$MONTH$DAY"

```
