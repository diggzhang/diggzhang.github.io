---
layout:     post
title:      "java.io.EOFException: Premature EOF: no length prefix available"
subtitle:   "麻了"
date:       2022-04-09
author:     "diggzhang"
tags:
    - hdfs
---

## 问题

背景是做磁盘备份操作。
DFS数据从一块磁盘拷贝到另一块磁盘。
在完成拷贝后，也可以顺利启动HDFS服务。

但是在试图传一个文件到HDFS上时却发生了一个错误：

```
hdfs dfs -put : Exception in createBlockOutputStream and java.io.EOFException: Premature EOF: no length prefix available
```

使用`fsck`检查全盘，看各种HDFS监控指标，都提示健康。
用查HDFS坏块的方法检查HDFS也没有发现坏块。

陷入沉思......

看了一些相同报错，问题大概锁定肯定是某个块文件导致：

1. https://stackoverflow.com/questions/34658876/java-io-eofexception-premature-eof-no-length-prefix-available
2. https://stackoverflow.com/questions/36792590/spark-java-io-eofexception-premature-eof-no-length-prefix-available
3. https://stackoverflow.com/questions/45769047/hdfs-dfs-put-exception-in-createblockoutputstream-and-java-io-eofexception-p
4. https://stackoverflow.com/questions/38548363/java-io-eofexception-premature-eof-no-length-prefix-available-in-spark-on-hado

## 解决

继续测试`put`一个文件到HDFS上，回顾报错里提到了报错的`blk`ID号：

```
16/07/23 20:05:21 WARN hdfs.DFSClient: DFSOutputStream ResponseProcessor exception  for block BP-532134798-128.110.152.143-1469321545728:blk_1073741865_1041
```

这是一个好线索，我尝试全盘扫描找到这个坏块。
到`dfs.datanode.data.dir`配置的磁盘目录下遍历检索发现确实存在这个`block`文件。
看起来没有什么不同。
但是使用`ls -al`详细列出文件时候，我发现了异样—— **文件所属用户和组与其它块文件不同**。
使用`find`命令彻查，果然发现产生了大量`root`用户产生的`block`，但是其实正常文件权限组该是`hdfs`用户。

```
find ./ -group root
```

至此，我大概厘清了问题。迁移前后dfs数据目录部分文件权限发生了变化。

相应的解决办法很简单，将整个`dfs.datanode.data.dir`指向的目录批量改成正确的权限组即可：

```
sudo chown -R hdfs:hdfs /path/to/dfs
```

