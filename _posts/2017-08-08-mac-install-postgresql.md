---
layout:     post
title:      "macOS下安装PostgreSQL"
subtitle:   ""
date:       2017-08-08
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - sql
---

本文希望通过非`brew install`方式在macOS下以最精简方式安装`postgresql`，在pg官网推荐列表中`postgres.app`无疑是精炼之选。

## CLI

`Postgres.app`本身包含了许多pg的CLI工具。如果希望使用`psql pg_dump pg_restore`等工具，只需要配置一下`$PATH`将Postgres.app内置的命令行工具包写入系统变量即可。


```shell
sudo mkdir -p /etc/paths.d &&
echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
```

最后重启一下终端让环境变量生效就可以使用了。

## GUI

至于图形管理pg的工具，推荐使用[postico](https://eggerapps.at/postico/)。

## 学习

教程推荐[postgresqltutorial](http://postgresqltutorial.com)，从基础的SQL方言讲起一直到运维相关到代码操作数据库都有涵盖，入门绝佳。
