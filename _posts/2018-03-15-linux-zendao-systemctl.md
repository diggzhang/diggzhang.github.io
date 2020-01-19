---
layout:     post
title:      "Centos7 Systemd禅道随机启动"
subtitle:   "忽悠，你接着忽悠"
date:       2018-03-15
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
in-post-img: "img/post-bg-unix-linux.jpg"

tags:
     - linux
---

目前网上搜到的禅道随机启动方法都是基于`init.d`或者干脆忽悠人自己开个脚本从环境变量加载启动。

不对不对统统不对，`Centos7`已经完全由`systemd`接手系统调度。

解决办法是写一个`systemd`控制脚本放到`/usr/lib/systemd/system`下面：

```shell
# /usr/lib/systemd/system/zendao.service
[Unit]
Description=ZenDao

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/opt/zbox/zbox start
ExecReload=/opt/zbox/zbox restart
ExecStop=/opt/zbox/zbox stop
StandardOutput=syslog
StandardError=syslog

[Install]
WantedBy=basic.target
```

注册到`systemd`中：

```shell
sudo systemctl enable zendao.service
sudo systemctl restart zendao.service
```
