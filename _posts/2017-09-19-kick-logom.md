---
layout:     post
title:      "crontab: temp file must be edited in place"
subtitle:   ""
date:       2017-09-19
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - linux
---


## 问题

很久以前在`macOS`下设置了两个cron job，如今想取消的时候发现报错。触发过程是这样的，试图使用`crontab -e`直接进入编辑任务，进入vim编辑模式修改好后保存退出。抛出错误：

`crontab: temp file must be edited in place`

修改也没有生效。


## 解决

在`.vimrc`里添加一个判断：

```shell
if $VIM_CRONTAB == "true"
    set nobackup
    set nowritebackup
endif
```

保存后重新从`crontab -e`编辑任务即可。

