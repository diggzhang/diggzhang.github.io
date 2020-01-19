---
layout:     post
title:      "阿里云MaxCompute"
subtitle:   "MaxCompute == ODPS"
date:       2016-05-09
author:     "diggzhang"
header-img: ""
tags:
    - big data
    - 阿里云

---

本文书摘于阿里云官方文档抽取核心信息备忘。

阿里云大数据计算服务(MaxCompute，原名ODPS)是一种快速、完全托管的TB/PB级数据仓库解决方案。MaxCompute向用户提供了完善的数据导入方案以及多种经典的分布式计算模型，使用MaxCompute可以与阿里云原生提供的BI报表工具配合完成分析需求，同时完成机器学习任务，最终将数据源抽取转换后持久化到数据库中。

一睹MaxCompute生态圈:

![ODPS生态圈图示](https://docs-aliyun.cn-hangzhou.oss.aliyun-inc.com/cn/odps/0.0.90/assets/summary/odps_frame.jpg)

大体看一下生态圈示意图，从数据通道模块讲起，`TUNNEL`提供高并发的离线数据上传下载服务，仅提供`Java`编程接口。`DataHub`使用RESTful接口向用户提供实时数据的发布(Publish)和订阅(Subscribe)的功能。

到计算模块，其一，ODPS只能以表的形式存储数据，并对外提供了SQL查询功能。用户可以将ODPS作为传统的数据库软件操作，但并不是纯正的SQL语句查询，有一定的区别，该功能适用于实时性不高的场合。其二，计算模块也提供了`MapReduce`运算接口：`ODPS MapReduce`，仅提供`Java`编程接口，且要求用户对分布式计算概念有一定了解。

如果寻求合适的数据仓库解决方案，考虑MaxCompute无疑是首选，从功能接口到定价来看性价比还算OK。
