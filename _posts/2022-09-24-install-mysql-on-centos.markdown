---
layout:     post
title:      "安装MySQL 8到CentOS 7.9"
subtitle:   "高，实在是高"
date:       2022-09-24
author:     "diggzhang"
tags:
    - MySQL
---

# 1. 下载和安装

搜索到[MySQL Community Downloads](https://dev.mysql.com/downloads/repo/yum/) 获得MySQL源下载链接。

CentOS7 系统选择 **Red Hat Enterprise Linux 7 / Oracle Linux 7 (Architecture Independent), RPM Package** 下载。

下载完成后安装MySQL源：

```
sudo rpm -ivh mysql57-community-release-el7-9.noarch.rpm
```

接着可通过yum直接安装MySQL：

```
sudo yum install mysql-server
```

# 2. 启动前配置

修改 `/etc/my.cnf` 文件配置MySQL启动参数：

```
[mysqld]
# datadir=/var/lib/mysql
# socket=/var/lib/mysql/mysql.sock
datadir=/usr/local/bsjx/data/mysql
socket=/usr/local/bsjx/data/mysql/mysql.sock

log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
```

在上面示例中，`datadir`修改到一块挂载磁盘。
系统中如何开启SELinux，会导致MySQL无法用挂载的磁盘作为`datadir`启动。
可从`log-error`指向的日志中看到报错信息。
如果启动后遇到类似报错：

```
InnoDB: The innodb_system data file 'ibdata1' must be writable
```

则需要关闭SELinux才能顺利启动：

```
setenforce 0
```

# 3. 启动MySQL

启动MySQL:

```
sudo systemctl enable mysqld
sudo systemctl start mysqld
```

查看启动状态：

```
sudo systemctl status mysqld
```

在安装过程中，会为 MySQL root 用户生成一个临时密码。
mysqld.log使用以下命令找到它：

```
sudo grep 'password' /var/log/mysqld.log
```

执行后匹配出初始化的密码：

```
2022-09-24T06:09:39.950202Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: 4hL33yzBCp%N
```

# 4. 启动后的配置MySQL

`mysql_secure_installation` 工具可以协助更改默认密码和做数据库初始化的设置。

```
sudo mysql_secure_installation
```

执行后，跟随命令行配置引导完成设置。
这里建议在引导中选择删除`test`数据库，该库的权限验证机制不太一样。

# 5. 测试安装情况 

验证数据库安装情况：

```
mysqladmin -u root -p version
```

