---
layout:     post
title:      "使用Python监控磁盘空间"
subtitle:   "Python想必是极好的"
date:       2017-09-18
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
---

## 场景&&问题

我们在线上有一台专门做备份用的机器，磁盘几个T，负责存储每日备份好的数据压缩归档。由于磁盘量足够大，所以也一直没怎么关心磁盘空间的问题。终于在某一天磁盘爆满后，导致7z因为磁盘空间不足而压缩失败。

这种情况肯定不能一直人肉监控，使用Python脚本监控磁盘空间占用率，超出一定界值自动清理一些冗余数据，Emmm...想必是极好的。

主要用到的工具是`psutil`，调用`psutil.disk_usage()`可以获得所指定的磁盘空间占用率。

## CODE

```python
# coding:utf-8

"""
file name: disk_manager.py
env: python 2.7

Monitor on the target disk
If disk usage out of limit bounds
Execute the cleanup operation
"""

import os
import psutil # pip install psutil

DISK_USAGE_LIMT = 70 # 磁盘使用界限值70%
DIST_DISK       = "/Backups/" # 目标监控磁盘
CLEAN_TEMP_PATH = "/Backups/daily_backup/*.7z" # 清理路径


# 用os.system()去调用unix命令,返回0表示执行成功
def disk_cleaner():
    global CLEAN_TEMP_PATH
    cmd = "ls -al {}".format(CLEAN_TEMP_PATH)
    cmd_flag = os.system(cmd)
    cmd2 = "rm {}".format(CLEAN_TEMP_PATH)
    cmd2_flag = os.system(cmd2)
    print("Cleanup status {} {}".format(cmd_flag, cmd2_flag))


# disk_usage判断是否超出界限值
def monitor_disk():
    global DISK_USAGE_LIMT
    global DIST_DISK
    disk_percent = psutil.disk_usage(DIST_DISK).percent
    if disk_percent > DISK_USAGE_LIMT:
        print("Disk space usage: {}%, processing to cleanup... ".format(disk_percent))
        disk_cleaner()
    else:
        print("Disk space usage: {}%".format(disk_percent))


monitor_disk()
```

将写好的脚本部署到计划任务中，每天执行一次：

```shell
## clean up disk cron job
31 11 * * * /usr/bin/python /home/Scripts/disk_manager.py >> /tmp/disk_manager.log 2>&1
```
