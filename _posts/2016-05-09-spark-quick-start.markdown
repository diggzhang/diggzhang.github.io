---
layout:     post
title:      "Spark入门"
subtitle:   "简单了解Spark，快速入门Spark"
date:       2016-05-09
author:     "diggzhang"
header-img: "img/in-post/post-spark-intro/spark.png"
tags:
    - big data
    - Spark
---

打从听闻`Big Data`起，就有所耳闻`Hadoop`。然后便是`Spark`，再之后便是`Storm`。肯定的是，这些年来大数据生态圈技术愈发增多，技术栈愈发完善，但是万变不离其宗——`Hadoop/Spark/Strom`。可见大数据技术栈还是相当稳定，不像前端技术，真心是一天一变。今天借由Spark敲开大数据生态圈的家门，笔者是一个大数据小白，完全从0到1的开始了解Spark。

### Spark是什么

```
    Apache Spark™ is a fast and general engine for large-scale data processing.
```

太抽象，没学过，不懂。不过从官网介绍来看，容易理解的部分有:

0. `large-scale` + `data processing` = 大规模分布式计算;
1. 速度远远快于`Hadoop`，精于在内存中运算;
2. 支持80多种高阶运算，可以用`Scala`, `Python` 和 `R shells`作为开发语言;
3. 原生提供机器学习库，以及一些附加库;
4. `Runs Everywhere`可以单实例运行，也可以与其他技术栈合作运行

### 安装
目前看来，涉及的技术名词颇多，一些术语也不易理解，与其空洞的了解下去，还不如愉快的开始。挪步至[下载页](http://spark.apache.org/downloads.html)。

截止目前，我下载到的spark版本是1.6.1，获取一个安装包`spark-1.6.1.tgz`。

直接解压这个包，看看spark包里什么:

```shell
    $ tar -xvf spark-1.6.1.tgz
    $ ll
    drwxr-xr-x  46 diggzhang  staff   1.5K  2 27 12:40 spark-1.6.1
    -rw-r--r--   1 diggzhang  staff    12M  4 17 07:46 spark-1.6.1.tgz
    $ cd spark-1.6.1
    $ ls
    CHANGES.txt              docker                   project
    CONTRIBUTING.md          docker-integration-tests pylintrc
    LICENSE                  docs                     python
    NOTICE                   ec2                      repl
    R                        examples                 sbin
    README.md                external                 sbt
    assembly                 extras                   scalastyle-config.xml
    bagel                    graphx                   sql
    bin                      launcher                 streaming
    build                    licenses                 tags
    conf                     make-distribution.sh     tools
    core                     mllib                    tox.ini
    data                     network                  unsafe
    dev                      pom.xml                  yarn
    $ ./bin/spark-shell
    ls: /Users/diggzhang/code/spark/spark-1.6.1/assembly/target/scala-2.10: No such file or directory
    Failed to find Spark assembly in /Users/diggzhang/code/spark/spark-1.6.1/assembly/target/scala-2.10.
    You need to build Spark before running this program.
```
从解压出的目录结构来看，spark默认提供部署到AWS EC2的脚本，提供了docker部署build程序，另外还认识的有`sbt`是scala默认的build工具，其余工具暂还不认识。在我试图运行`./bin/spark-shell`时，提醒我得先build spark项目。那么接下来编译spark，让它跑起来。spark项目根目录下提供了`make-distribution.sh`文件，这个脚本可以帮助我们编译spark项目。Spark默认使用`Maven`管理项目，在github Spark主页给出`Building Spark`的办法是直接使用mvn build:

```shell
    $ build/mvn -DskipTests clean package
    # 脚本执行后，会从typesafe.com下载相关依赖，下载了两个包后报错退出了程序
```

```shell
    $ sh ./make-distribution.sh
    # 脚本本身还是在做mvn的事情，但是直接执行后一直假死状态
```

以上两种方法尝试无效后，我使用了[官方文档的方法](http://spark.apache.org/docs/latest/building-spark.html)， 谢天谢地生效了，这段mvn脚本自动下载了相关依赖并设置好了相关环境，不过耗时可能将超过1小时:

```shell
    $ build/mvn -Pyarn -Phadoop-2.4 -Dhadoop.version=2.4.0 -DskipTests clean package
```

除了上述方法外，Spark官方文档还介绍了其它方法和一些build时候可能遇到的坑，推荐看一下。其实何必如此痛苦呢？Spark下载页提供了编译后的安装，不如[直接去下载](http://www.apache.org/dyn/closer.lua/spark)。

### Hello World

编译/安装完成后，终于可以在吐血前，开始尝试一下spark shell，`Spark Shell`是spark为用户提供的最直接的操作spark API的交互工具，简单的代码测试，API操作都可以在`Spark Shell`内完成:

```
➜  spark-1.6.1-bin-hadoop2.6  ./bin/spark-shell
log4j:WARN No appenders could be found for logger (org.apache.hadoop.metrics2.lib.MutableMetricsFactory).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.
Using Spark's repl log4j profile: org/apache/spark/log4j-defaults-repl.properties
To adjust logging level use sc.setLogLevel("INFO")
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /___/ .__/\_,_/_/ /_/\_\   version 1.6.1
      /_/

Using Scala version 2.10.5 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_73)
Type in expressions to have them evaluated.
Type :help for more information.
Spark context available as sc.
16/05/10 14:57:14 WARN Connection: BoneCP specified but not present in CLASSPATH (or one of dependencies)
16/05/10 14:57:14 WARN Connection: BoneCP specified but not present in CLASSPATH (or one of dependencies)
16/05/10 14:57:17 WARN ObjectStore: Version information not found in metastore. hive.metastore.schema.verification is not enabled so recording the schema version 1.2.0
16/05/10 14:57:17 WARN ObjectStore: Failed to get database default, returning NoSuchObjectException
16/05/10 14:57:18 WARN Connection: BoneCP specified but not present in CLASSPATH (or one of dependencies)
16/05/10 14:57:18 WARN Connection: BoneCP specified but not present in CLASSPATH (or one of dependencies)
16/05/10 14:57:20 WARN ObjectStore: Version information not found in metastore. hive.metastore.schema.verification is not enabled so recording the schema version 1.2.0
16/05/10 14:57:20 WARN ObjectStore: Failed to get database default, returning NoSuchObjectException
SQL context available as sqlContext.

scala>
```
进入Spark Shell后发现其实最终开启的是`scala shell`，虽然报了一堆`WARN`，但总算Spark处于待命状态。跟着github README里的例子试试手:

```java
scala> sc.parallelize(1 to 1000).count()
res1: Long = 1000
```

已经成功跑来了Spark，这里有两个教程或许你也会感兴趣，已经搭建好了环境就可以跟着学一下了:

1. [Scala Tutorial](http://people.cis.ksu.edu/~schmidt/705a/Scala/scala_tutorial.pdf)
2. [Big Data Mini Course](http://ampcamp.berkeley.edu/big-data-mini-course/index.html)

Spark虽然是scala写成，但也提供了python的接口，顺便尝试一把`pyspark`:

```
➜  spark-1.6.1-bin-hadoop2.6  ./bin/pyspark
Python 2.7.10 (default, Sep 23 2015, 04:34:21)
[GCC 4.2.1 Compatible Apple LLVM 7.0.0 (clang-700.0.72)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
Using Spark's default log4j profile: org/apache/spark/log4j-defaults.properties
16/05/10 15:14:26 INFO SparkContext: Running Spark version 1.6.1
.........
16/05/10 15:14:27 INFO SparkEnv: Registering OutputCommitCoordinator
16/05/10 15:14:28 INFO Utils: Successfully started service 'SparkUI' on port 4040.
16/05/10 15:14:28 INFO SparkUI: Started SparkUI at http://192.168.1.100:4040
16/05/10 15:14:28 INFO Executor: Starting executor ID driver on host localhost
16/05/10 15:14:28 INFO Utils: Successfully started service 'org.apache.spark.network.netty.NettyBlockTransferService' on port 59976.
16/05/10 15:14:28 INFO NettyBlockTransferService: Server created on 59976
16/05/10 15:14:28 INFO BlockManagerMaster: Trying to register BlockManager
16/05/10 15:14:28 INFO BlockManagerMasterEndpoint: Registering block manager localhost:59976 with 511.1 MB RAM, BlockManagerId(driver, localhost, 59976)
16/05/10 15:14:28 INFO BlockManagerMaster: Registered BlockManager
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /__ / .__/\_,_/_/ /_/\_\   version 1.6.1
      /_/

Using Python version 2.7.10 (default, Sep 23 2015 04:34:21)
SparkContext available as sc, HiveContext available as sqlContext.
# 用spark读取当前目录下的README.md
>>> raw_data = sc.textFile("README.md")
16/05/10 15:16:49 INFO MemoryStore: Block broadcast_0 stored as values in memory (estimated size 127.4 KB, free 127.4 KB)
16/05/10 15:16:49 INFO MemoryStore: Block broadcast_0_piece0 stored as bytes in memory (estimated size 13.9 KB, free 141.3 KB)
16/05/10 15:16:49 INFO BlockManagerInfo: Added broadcast_0_piece0 in memory on localhost:59976 (size: 13.9 KB, free: 511.1 MB)
16/05/10 15:16:49 INFO SparkContext: Created broadcast 0 from textFile at NativeMethodAccessorImpl.java:-2
# 老板，来5行先尝尝
>>> raw_data.take(5)
16/05/10 15:17:15 INFO FileInputFormat: Total input paths to process : 1
16/05/10 15:17:16 INFO SparkContext: Starting job: runJob at PythonRDD.scala:393
.......
16/05/10 15:17:26 INFO DAGScheduler: Job 0 finished: runJob at PythonRDD.scala:393, took 10.452861 s
[u'# Apache Spark', u'', u'Spark is a fast and general cluster computing system for Big Data. It provides', u'high-level APIs in Scala, Java, Python, and R, and an optimized engine that', u'supports general computation graphs for data analysis. It also supports a']
>>>
# 就是这么用，虽然各种log多，但果真童叟无欺
```

### Spark Example 简单开发，直观感受

依照官方示例，写个word count程序，借由这个小程序了解一下Spark的工作模式:

```scala
scala> import org.apache.spark.SparkContext
import org.apache.spark.SparkContext

scala> import org.apache.spark.SparkContext._
import org.apache.spark.SparkContext._

scala> val txtFile = "README.md"
txtFile: String = README.md

scala> val txtData = sc.textFile(txtFile)
txtData: org.apache.spark.rdd.RDD[String] = README.md MapPartitionsRDD[1] at textFile at <console>:33

scala> txtData.cache()
res1: txtData.type = README.md MapPartitionsRDD[1] at textFile at <console>:33

scala> txtData.count()
res2: Long = 95

// 以上是一个词数统计程序
// 以下是一个词频统计程

scala> val wcData = txtData.flatMap(l => l.split(" ")).map(word => (word, 1)).reduceByKey(_ + _)

scala> wcData.collect().foreach(println)
(package,1)
(this,1)
(Version"](http://spark.apache.org/docs/latest/building-spark.html#specifying-the-hadoop-version),1)
(Because,1)
(Python,2)
(cluster.,1)
(its,1)
([run,1)
(general,2)
(have,1)
(pre-built,1)
..............

```

到了这一步，我们已经知道如何用spark shell写出简单实用的小程序，但还不足以触碰项目级的开发，虽然可以使用`pyspark`用大数据全栈式语言python开发，但Spark默认支持的是scala语言的接口，如果问两者的开发的区别的话，那最根本的区别是原生API支持与否的问题。如果追求程序效率选择`Scala`，如果追求快速开发选择`Python`。

### Spark开发语言的选择

Spark是基于scala开发的，虽然已经支持python、R语言，但是如果在生产环境，建议还是使用scala去开发。首先是因为Python天生是弱类型的语言，在生产环境下不可避免的会出现一些因弱类型导致的错误，我们无法穷尽所有可能性并用python做出处理。相较而言，scala则对变量声明有严格要求，会在编译阶段抛出所有变量导致的错误。其次一个重要原因则是因为scala是基于JVM的语言，要知道，整个hadoop生态圈都是基于JVM的，而python只能依赖第三方库去操作底层文件系统`HDFS`，支持较差。Scala则依靠Hadoop原生Java API接口，很容易就可以用scala构建一个Hadoop应用。

### 涉及的技术名词

以下是文中涉及的技术名词，稍作了解更容易明白整个技术栈是如何协作的:

1. mvn
2. sbt
3. scala
4. SparkContext
5. HDFS
