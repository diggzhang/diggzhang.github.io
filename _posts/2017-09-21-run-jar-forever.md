---
layout:     post
title:      "Run Jar Forever"
subtitle:   "java如果有pm2就好了"
date:       2017-09-21
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - Java
---

## 场景&&问题

我们在线上有一个jar包是用nohup方式启动，当报错挂掉后不会自动重启。搜索了一番java中不存在类似pm2一样顺手的进程监护管理工具，于是决定自己实现一个简单的监控脚本，保证jar包挂掉后还能重启就行。

处理思路就是：crontab + shell 定时任务监护。

## CODE

```shell
# jar processing manager @diggzhang20170921
*/5 * * * * cd /home/master/event/ && /usr/bin/sh /home/master/event/jar_pm.sh
```

```shell
#!/usr/bin/env bash

# ##################################################
# Java Processing Manager
#
#
# HISTORY:
#
# * 20170921 - v0.0.1  - First Creation
#
# ##################################################

version="0.0.1"
scriptBasename="jar_pm.sh"
scriptPath="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
logFile="/tmp/${scriptBasename}.`date "+%Y%m%d"`.log"
procName="eventreceiver-0.0.1-SNAPSHOT-allinone.jar"
procPath="/home/master/event/repox-assembly-0.1-SNAPSHOT.jar"

echolog()
(
    echo "$1"
    echo "$1" >> "$logFile"
)

echolog $scriptPath
echolog $logFile

proc_num()
{
    num=`ps -ef | grep $procName | grep -v grep | wc -l`
    return $num
}

proc_id()
{
    pid=`ps -ef | grep $procName | grep -v grep | awk '{print $2}'`
}

proc_num
number=$?
echo $number

if [ $number -eq 0 ]
then
    nohup java -jar $procPath >> /tmp/$procName_`date "+%Y%m%d"`.log 2>&1 &
    proc_id
    echolog ${pid}
fi
```

[GitHub Repo](https://github.com/diggzhang/jarpm)
