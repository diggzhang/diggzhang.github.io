---
layout:     post
title:      "pyenv-virtualenv install"
subtitle:   "什么nvm、rvm都跟pyenv一样，不知道高哪里去"
date:       2017-07-03
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
---

## 问题

开发不同的python项目，先不说该用python2还是3，用到不同依赖就足以折腾一阵子。区分项目环境的最好办法是用到`virtualenv`,至于`pyenv-virtualenv`可以理解是virtualenv的升级版本，最大区别是定制好环境后，进不同项目不用再手动`source <env>/bin/activate`一下。

## Install pyenv

第一步是`pyenv`安装，该工具可以使系统内装多个`python`版本共存：

```shell
brew install pyenv
```

如果是CentOS环境，系统底层依赖包如下：

```shell
sudo yum install gcc zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel tk-devel libffi-devel
```


## Install python3

```shell
$ pyenv versions
   system

$ pyenv install --list

$ pyenv install 3.6.0

$ pyenv versions
   system
   3.6.0
```

至此`pyenv`环境上安装了一个`python3`，关于`pyenv`的详细用法可以去官方repo看readme，下面安装`pyenv-virtualenv`。

## Install pyenv-virtualenv

```shell
$ brew install pyenv-virtualenv
```

关键步骤： 环境初始化

```shell

# vim /etc/profile or ~/.zshrc

eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

```

## Create virtual env

基于`pyenv`里安装好的`python3.6.0`创建一个`virtualenv`环境

```shell
$ pyenv virtualenv 3.6.0 python3env

# after create checkout:
$ pyenv virtualenvs
```

## Activate

等待环境创建成功后启动虚拟环境：

```shell
$ cd ~/code/superset
$ pyenv shell python3env

$ pyenv virtualenvs
  3.6.0/envs/python3env (created from /Users/diggzhang/.pyenv/versions/3.6.0)
* python3env (created from /Users/diggzhang/.pyenv/versions/3.6.0)

$ pyenv activate python3env
pyenv-virtualenv: version `python3env` is already activated
```

## Deactivate

用完后注销

```shell
$ pyenv deactivate
```

## Delete existing virtualenv

删除不需要的虚拟环境

```shell
$ pyenv uninstall python3env
```

## Install FAB

`pip3`实验: 在我们的测试目录下，安装了一个`flask-appbuilder`，退出测试目录看`freeze`信息不同，说明环境隔离。

```shell
$ pip3 install flask-appbuilder

$ pip3 freeze
Babel==2.4.0
click==6.7
colorama==0.3.9
defusedxml==0.5.0
Django==1.7
Flask==0.12.2
Flask-AppBuilder==1.9.1
Flask-Babel==0.11.2
Flask-Login==0.2.11
Flask-OpenID==1.2.5
Flask-SQLAlchemy==2.1
Flask-WTF==0.14.2
itsdangerous==0.24
Jinja2==2.9.6
MarkupSafe==1.0
python3-openid==3.1.0
pytz==2017.2
selenium==3.4.1
SQLAlchemy==1.1.11
Werkzeug==0.12.2
WTForms==2.1
You are using pip version 7.1.2, however version 9.0.1 is available.
You should consider upgrading via the 'pip install --upgrade pip' command.

# 退出virtualenv shell activate环境启动的目录,可以得出包依赖隔离了
$ pwd
/Users/diggzhang
$ pip3 freeze
Django==1.7
pytz==2017.2
selenium==3.4.1
You are using pip version 7.1.2, however version 9.0.1 is available.
You should consider upgrading via the 'pip install --upgrade pip' command.
```

## Final Question

但其实我们最终最终的理想效果是当切换到某个项目的目录下，自动激活相应的python版本并且配套相应的各种库。前面我们已经创建了一个环境叫`python3env`，我们希望当进入到`~/code/superset`目录后自动激活该环境，非常简单：

```shell
# 第一步进入项目目录：
$ cd ~/code/superset

# 检查当前所有版本,发现有已经创建好的python3env虚拟环境
$ pyenv versions
  system
  3.6.0
  3.6.0/envs/python3env
* python3env (set by /Users/diggzhang/code/superset/.python-version)

# 实现目的最最最关键步骤设置当前目录的local
$ pyenv local python3env
```

回顾一下大概的流程：

```
[安装pyenv]-[在pyenv里安装不同python版本]-[安装pyenv-virtualenv]-[创建pyenv-virtualenv环境]-[在项目目录下设置pyenv local]
```

未来希望启动一个依赖隔离的项目时候应该：

```
[创建pyenv-virtualenv环境]-[在项目目录下设置pyenv local]
```

## Common build problems

在装不同版本python环境版本过程中，不同操作系统平台会遇到不同麻烦，[Common build problems](https://github.com/pyenv/pyenv/wiki/Common-build-problems)页面总结了大部分问题，参考可以有效解决安装之前的麻烦。
