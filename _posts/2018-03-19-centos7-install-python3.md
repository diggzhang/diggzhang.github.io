---
layout:     post
title:      "Centos7 Install Python3"
subtitle:   ""
date:       2018-03-19
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
in-post-img: "img/post-bg-unix-linux.jpg"

tags:
     - linux
     - python3
---

**使用默认yum源装的python34/36可能会导致后续装库时候产生依赖问题。**

生产环境做python部署总是遇到一些坑，这里存下折腾过程备忘，系统层依赖：

```shell
sudo yum -y update
sudo yum -y install yum-utils
sudo yum -y groupinstall development
```

CentOS7默认是Redhat源，虽然提供了`python34`，但是还是使用`IUS`社区源避开一些后期遇到的依赖问题：

```shell
sudo yum -y install https://centos7.iuscommunity.org/ius-release.rpm
sudo yum -y install python36u
sudo yum -y install python36u-pip
sudo yum -y install python36u-devel
```
