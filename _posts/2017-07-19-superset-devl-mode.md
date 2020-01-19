---
layout:     post
title:      "incubator-superset/airbnb superset开发模式"
subtitle:   "superset改了N个名字了"
date:       2017-07-19
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: superset
tags:
     - superset
     - BIG DATA
---

近期我们在搞内部数据平台构建，最终选型尝试一下airbnb黑客松项目起家的`superset`,该项目之前也叫`Caravel`和`Panoramix`,目前主打BI的Web应用，由Apache基金会操刀主治。

最基础的`pip install superset`的我们不讲，如果有需要定制的需求，肯定需要clone源码自己研究。自己手动编译`superset`的过程中踩了一些坑，借本文备忘。

如果有手动编译定制`superset`的需求，需要读的第一个文档是superset项目下的`CONTRIBUTING.md`，[github链接](https://github.com/apache/incubator-superset/blob/master/CONTRIBUTING.md#documentation-1)。

## 资源准备

基础的三个步骤：

- Clone code
- Install System dependency
- pyenv initial

gitclone源码的同时，同步解决系统依赖问题：

```shell
git clone https://github.com/apache/incubator-superset.git
```

**在clone完成后，设置一下开发环境，这里推荐使用[pyenv](http://yangcongchufang.com/pyenv-virtualenv-installtion.html)。**

```shell
pyenv install 3.5.0
pyenv virtualenv 3.5.0 superset_env_py3
pyenv local superset_env_py3
```

因为superset底层负责密码传输的加密库用到系统级依赖，不同的操作系统有不同的依赖安装方式，参考superset官方文档即可，下面以macOS为例，在`pyenv`环境已经设置好的前提下：

```shell
brew install pkg-config libffi openssl python

# 如果不执行这一步在后续的setup过程中会失败
env LDFLAGS="-L$(brew --prefix openssl)/lib" CFLAGS="-I$(brew --prefix openssl)/include" pip install cryptography==1.7.2
```

使用pyenv是为了保证开发环境的独立性，具体用法不详述。可以按照官方文档建议只用`VirtualEnv`，他们目的都是一个意思。
至此基础的三个步骤完成。

我在测试过程中，使用的环境是：

```
Python 3.5.0 (不建议更高版本)
pip 7.1.2 (可以升级到9)
npm 5.0.3 (可以替换为cnpm)
superset 0.19.1
```

## Backend Build

源码clone好，异同依赖和虚拟环境准备好，就可以开始编译后端部分了。

```shell
# 涉及使用flask-cache需要装redis包
pip install redis

# install for development
# 这个步骤的执行时间比较长(夹带处理各种突发情况一共耗费40min),作用是装了superset所需要的基础依赖包
python setup.py develop

# Create an admin user
fabmanager create-admin --app superset

# Initialize the database
superset db upgrade

# Create default roles and permissions
superset init

# Load some data to play with
superset load_examples

# start a dev web server
superset runserver -d
```

在执行`python setup.py develop`你可能会遇到`'openssl/opensslv.h' file not found`，这个时候解决办法是在shell内执行下述命令，参考[issue](https://github.com/pyca/cryptography/issues/3489)：

```shell
brew upgrade openssl
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

此外，在python 3.6.0 环境安装过程中抛出错误如下，很有可能是包依赖问题导致，只好切换到3.5.0环境做测试:

```shell
During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "setup.py", line 94, in <module>
    'Programming Language :: Python :: 3.5',
```

执行`runserver`后，打开[http://localhost:8081/](http://localhost:8081/)即可体验，但是发现前端页面还是空架子状态。


## 前端组件

编译前端两部曲：

- npm install
- npm run build

这两步是前端依赖的下载和编译，耗时较长。

在superset源码主目录下的`./superset/assets`下载和编译前端依赖：

```shell
# assuming $SUPERSET_HOME as the root of the repo
cd $SUPERSET_HOME/superset/assets
npm install #切换cnpm install速度尤佳
npm run build #build过程比较消耗CPU
```

这里有个前端的坑，如果你的`npm`相关命令明明已经执行成功，还是提示缺包，建议最佳办法是换用`cnpm`去做install相关工作。
我在折腾`npm`下载包不全的问题时候，甚至重装了`node`。官方文档提议mac用户用brew装`node`时候设置了`without npm`，而是手工安装，但即使手工安装也可能导致的最终结果是:`npm command not found`。这个时候最快的解决办法是从node官网重新下载pkg包安装。


## 最终

终于可以开始开发了，你需要开两个终端一个跑前端，一个跑后端：

```shell
# 后端在$SUPERSET_HOME下执行
./superset/bin/superset runserver -d -p 8081
# 前端在$SUPERSET_HOME/superset/assets下执行
npm run dev
```

## 参考链接

老司机车开的特别稳，你可一定要好好读读： [Superset前辈踩坑](http://yuzhouwan.com/posts/743/)
