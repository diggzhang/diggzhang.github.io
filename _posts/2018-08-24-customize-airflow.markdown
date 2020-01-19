---
layout:     post
title:      "如何自己打包Apache-airflow"
subtitle:   "打铁还需自身硬"
date:       2018-08-24
author:     "diggzhang"
category: "airflow"
tags:
    - airflow
---

### 1. 获取源码

```
git clone https://github.com/apache/incubator-superset.git
```

### 2. git切换到稳定版本

```
git checkout d760d63e1a141a43a4a43d
git checkout v1-9-stable
```

或通过查看release直接下载某个稳定版本源码:
https://github.com/apache/incubator-superset/releases/tag/0.19.0

### 3. 环境准备

通过virtualenv或其他方式创建干净的依赖环境。
修改源码源码，完成定制后，进入打包阶段。

### 4. 打包

在airflow源码主目录下执行

```
python setup.py install
```

或

```
sh ./INSTALL
```

setuptools会依赖setup.cfg和setup.py完成打包。最终生成的文件会放到dist目录下：

```
apache-airflow-1.10.0.dev0+incubating.tar.gz
apache_airflow-1.10.0.dev0+incubating-py2.7.egg
```

### 5. 安装

```
easy_install ./apache_airflow-1.10.0.dev0+incubating-py2.7.egg
```

安装完成后通过pip list验证：

```
Package          Version
---------------- ----------------------
apache-airflow   1.10.0.dev0+incubating
```