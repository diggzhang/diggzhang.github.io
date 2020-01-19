---
layout:     post
title:      "在VMwareFusion中搭建Cloudera-CDH5实验环境"
subtitle:   "老板，麻烦来10根内存条，打包谢谢"
date:       2017-04-06
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - bigdata
     - CDH
     - Cloudera
---

`Cloudera`是大数据软件领域的大哥大，出自本家的`CDH5`是大哥亲手封装的大数据套装，在自己机器搭一个`CDH5`跑起来，就可以宣布是大数据领域的`Hello World`了。

## 虚拟机配置

实验环境操作系统是`CentOS 6.7`，由于`CentOS 6`到`7`管理方式变更，为了保证能简单快速找到资料，建议还是使用6系。

如果希望尽快尝鲜，可以去cloudera官方下载官方提供的虚拟机镜像包，速度还不错。

虚拟机搭建，操作系统安装部分不累述，本文以两个节点为例，主节点`hostname: elephant`，从节点名`monkey`。特别要求`elephant`的内存至少`8GB`，主节点内存分配过低后续实验会因为服务启动异常而失败。

（搭建`elephant`节点的`vmx`文件概览，`memsize`为`8192`)

```
......
scsi0.virtualDev = "lsilogic"
memsize = "8192"
mem.hotadd = "TRUE"
scsi0:0.present = "TRUE"
scsi0:0.fileName = "CentOS_6.5_CDH_5.6.vmdk"
......
```

为了保证游戏尽快开始，虚拟机网络配置我选择了桥接模式，由同局域网的路由器分配IP地址。

启动各个节点后，使用`su`切换到`root`用户，以下所有操作在`root`权限下完成。

## 节点初始设置

`CDH`集群里，给个名分很重要，第一个准备工作就是设置各个节点的`hostname`。

1) 在`/etc/sysconfig/network`设置

```shell
vim /etc/sysconfig/network

NETWORKING=yes
HOSTNAME=elephant
```

2) 然后使用`hostname`命令设置

```shell
hostname elephant
```

3) 修改各个节点的`/etc/hosts`

```shell
vim /etc/hosts

127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.8.2.103 elephant
10.8.2.125 monkey
```

4) 检查是否能互相`ping`通

```shell
ping elephant
ping monkey
```

5) 关闭防火墙和`SELinux`

关闭防火墙并禁止开机启动

```shell
service iptables stop
chkconfig iptables off
```

关闭`SELinux`并设置其立即生效

```shell
vim /etc/selinux/config

SELINUX=disabled

保存，随后执行命令
setenforce 0
```

## 创建CDH软件源

因为大数据栈涉及的软件包繁杂，一般会选择在本地节点上自建repo，避开因为网络问题导致依赖包下载crash。官方文档已经给出了自建repo的办法，[参考 Creating a Local Yum Repository](https://www.cloudera.com/documentation/enterprise/latest/topics/cdh_ig_yumrepo_local_create.html)。

其实说白了就是将这堆软件包下载到本地先，你也可以选择只添加`cloudera`的`Repository`通过网络下载，国内速度体验其实还好（1小时以上）。

软件包同步好后，回得到两个文件夹：

```
cloudera-manager
Cloudera-cdh5
```

将这两个文件夹拷贝到`/var/www/html/`，并分别进入执行`creterepo .`:

```shell
cd /va/www/html/cloudera-manager; createrepo .
cd /va/www/html/Cloudera-cdh5; createrepo .
```

然后启动`http`服务:

```shell
service httpd start
chkconfig httpd on
```

访问`http://elephant/cloudera-manager`测试目录是否正确。

然后创建`repo`文件，一个`manager`的，一个`cdh5`的：

```shell
vim /etc/yum.repos.d/cloudera-manager.repo

[cloudera-manager]
name=elephant manager
baseurl=http://elephant/cloudera-manager/
gpgcheck=0
```

```shell
vim /etc/yum.repos.d/cloudera-cdh5.repo

[cloudera-cdh5]
name=cloudera-cdh5
baseurl=http://elephant/Cloudera-cdh5/
gpgcheck=0
```

两个repo文件准备好后，发往`monkey`节点一份:

```shell
scp /etc/yum.repos.d/*.repo root@monkey:/etc/yum.repos.d/
```   

最后，所有节点生成一次缓存：

```shell
yum clean all
yum makecache
```

## 安装JDK

所有节点安装`JDK`:

```shell
yum install oracle-j2sdk1.7
```

然后所有节点配置`Java`环境变量：

```shell
ln -s /usr/java/jdk1.7.0_67-cloudera /usr/java/default
echo -e 'export JAVA_HOME=/usr/java/default' >> /etc/profile
echo -e 'export PATH=$JAVA_HOME/bin:$PATH'>> /etc/profile
alternatives --install /usr/bin/java java /usr/java/jdk1.7.0_67-cloudera/bin/java 200 alternatives --set java /usr/java/jdk1.7.0_67-cloudera/bin/java
alternatives --install /usr/bin/javac javac /usr/java/jdk1.7.0_67-cloudera/bin/javac 200
alternatives --set javac /usr/java/jdk1.7.0_67-cloudera/bin/javac
```

激活设置

```shell
soruce /etc/profile
```

## cloudera-manager-agent

重头戏来了，所有节点安装`cloudera-manager-agent`:

```shell
yum install cloudera-manager-agent
```

然后修改所有节点的`agent`配置文件，`server_host`更名`elephant`：

```shell
vim /etc/cloudera-scm-agent/config.ini | more

[General]
# Hostname of the CM server.
server_host=elephant
```

然后所有节点启动agent：

```shell
service cloudera-manager-agent start
```


## 主节点安装CM Server程序

在`elephant`安装server程序：

```shell
yum insall cloudera-manager-server-db-2
```

安装好db2后，顺便会安装好server端套餐:

```
cloudera-scm-server
cloudera-scm-server-db
```

**按顺序启动：**

```shell
service cloudera-scm-server-db start
service cloudera-scm-server start
```

`cloudera-scm-server`的启动会花些时间，紧接着装大数据技术栈的软件组。

## 大数据技术栈软件组

所有节点执行：

```shell
sudo yum --assumeyes install hadoop-client hadoop-hdfs hadoop-httpfs hadoop-mapreduce hadoop-yarn hadoop-0.20-mapreduce zookeeper hive hive-webhcat-server impala impala-shell llama-master pig flume-ng sqoop sqoop2 sqoop2-client oozie oozie-client hue-common hue-beeswax hue-hbase hue-impala hue-pig hue-plugins hue-rdbms hue-search hue-spark hue-sqoop hue-zookeeper hue-search hbase solr hbase-solr crunch spark-core spark-python bigtop-jsvc bigtop-utils bigtop-tomcat cloudera-manager-agent cloudera-manager-daemons
```

## 系统优化设置

设置系统尽量不要用到swap：

```shell
vim /etc/sysctl.conf

vm.swappiness = 0

保存后激活

sysctl -p
```

禁用`hugepage`:

```shell
echo never > /sys/kernel/mm/redhat_transparent_hugepage/defrag
```

停掉不需要的服务：

```shell
chkconfig oozie off
chkconfig hadoop-httpfs off
chkconfig hive-webhcat-server off
```

## END

浏览器访问`http://elephant:7180`即可看到cm管理界面，用户名密码均为`admin`。

进入后跟着引导high，但受限于机器性能和内存空间，安装的服务不保证能跑起来，enjoy。
