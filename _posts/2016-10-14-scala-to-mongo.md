---
layout:     post
title:      "使用scala连接到MongoDB"
subtitle:   "scala casbah mongodb"
date:       2016-10-14
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: "MongoDB小司机"
tags:
     - mongodb
     - scala
---

mongo官方文档推荐用Scala的`casbah`库连接到mongo做数据分析。尝试一下，首先创建`build.sbt`，我希望用sbt来试水这个工具:


```shell
scalaVersion := "2.11.8"

libraryDependencies += "org.mongodb" %% "casbah" % "3.1.1"

```

之后执行`sbt console`，下载依赖包的时候发现了一个这样的错误，sbt又出问题，解决办法是删除了`~/.ivy2`整个目录，简单粗暴无脑，但是有效:

```shell
➜  casbah_tutorial git:(master) ✗ ls
build.sbt
➜  casbah_tutorial git:(master) ✗ sbt console
[info] Loading global plugins from /Users/diggzhang/.sbt/0.13/plugins
[info] Set current project to Casbah Tutorial (in build file:/Users/diggzhang/code/newWayToWorld/casbah_tutorial/)
[info] Updating {file:/Users/diggzhang/code/newWayToWorld/casbah_tutorial/}casbah_tutorial...
[info] Resolving jline#jline;2.12.1 ...
[error] org.mongodb#mongo-java-driver;3.2.2!mongo-java-driver.jar origin location must be absolute: file:/Users/diggzhang/.m2/repository/org/mongodb/mongo-java-driver/3.2.2/mongo-java-driver-3.2.2.jar
java.lang.IllegalArgumentException: org.mongodb#mongo-java-driver;3.2.2!mongo-java-driver.jar origin location must be absolute: file:/Users/diggzhang/.m2/repository/org/mongodb/mongo-java-driver/3.2.2/mongo-java-driver-3.2.2.jar
	at org.apache.ivy.util.Checks.checkAbsolute(Checks.java:57)
	at org.apache.ivy.core.cache.DefaultRepositoryCacheManager.getArchiveFileInCache(DefaultRepositoryCacheManager.java:387)
	at org.apache.ivy.core.cache.DefaultRepositoryCacheManager.download(DefaultRepositoryCacheManager.java:851)
	at org.apache.ivy.plugins.resolver.BasicResolver.download(BasicResolver.java:835)
	at org.apache.ivy.plugins.resolver.RepositoryResolver.download(RepositoryResolver.java:282)
	at org.apache.ivy.plugins.resolver.ChainResolver.download(ChainResolver.java:219)
	at org.apache.ivy.plugins.resolver.ChainResolver.download(ChainResolver.java:219)
	at org.apache.ivy.core.resolve.ResolveEngine.downloadArtifacts(ResolveEngine.java:388)
	at org.apache.ivy.core.resolve.ResolveEngine.resolve(ResolveEngine.java:331)
	at org.apache.ivy.Ivy.resolve(Ivy.java:517)
	at sbt.IvyActions$.sbt$IvyActions$$resolve(IvyActions.scala:301)
	at sbt.IvyActions$$anonfun$updateEither$1.apply(IvyActions.scala:191)
	at sbt.IvyActions$$anonfun$updateEither$1.apply(IvyActions.scala:168)
	at sbt.IvySbt$Module$$anonfun$withModule$1.apply(Ivy.scala:156)
	at sbt.IvySbt$Module$$anonfun$withModule$1.apply(Ivy.scala:156)
	at sbt.IvySbt$$anonfun$withIvy$1.apply(Ivy.scala:133)
	at sbt.IvySbt.sbt$IvySbt$$action$1(Ivy.scala:57)
	at sbt.IvySbt$$anon$4.call(Ivy.scala:65)
	at xsbt.boot.Locks$GlobalLock.withChannel$1(Locks.scala:93)
	at xsbt.boot.Locks$GlobalLock.xsbt$boot$Locks$GlobalLock$$withChannelRetries$1(Locks.scala:78)
	at xsbt.boot.Locks$GlobalLock$$anonfun$withFileLock$1.apply(Locks.scala:97)
	at xsbt.boot.Using$.withResource(Using.scala:10)
	at xsbt.boot.Using$.apply(Using.scala:9)
	at xsbt.boot.Locks$GlobalLock.ignoringDeadlockAvoided(Locks.scala:58)
	at xsbt.boot.Locks$GlobalLock.withLock(Locks.scala:48)
	at xsbt.boot.Locks$.apply0(Locks.scala:31)
	at xsbt.boot.Locks$.apply(Locks.scala:28)
	at sbt.IvySbt.withDefaultLogger(Ivy.scala:65)
	at sbt.IvySbt.withIvy(Ivy.scala:128)
	at sbt.IvySbt.withIvy(Ivy.scala:125)
	at sbt.IvySbt$Module.withModule(Ivy.scala:156)
	at sbt.IvyActions$.updateEither(IvyActions.scala:168)
	at sbt.Classpaths$$anonfun$sbt$Classpaths$$work$1$1.apply(Defaults.scala:1439)
	at sbt.Classpaths$$anonfun$sbt$Classpaths$$work$1$1.apply(Defaults.scala:1435)
	at sbt.Classpaths$$anonfun$doWork$1$1$$anonfun$90.apply(Defaults.scala:1470)
	at sbt.Classpaths$$anonfun$doWork$1$1$$anonfun$90.apply(Defaults.scala:1468)
	at sbt.Tracked$$anonfun$lastOutput$1.apply(Tracked.scala:37)
	at sbt.Classpaths$$anonfun$doWork$1$1.apply(Defaults.scala:1473)
	at sbt.Classpaths$$anonfun$doWork$1$1.apply(Defaults.scala:1467)
	at sbt.Tracked$$anonfun$inputChanged$1.apply(Tracked.scala:60)
	at sbt.Classpaths$.cachedUpdate(Defaults.scala:1490)
	at sbt.Classpaths$$anonfun$updateTask$1.apply(Defaults.scala:1417)
	at sbt.Classpaths$$anonfun$updateTask$1.apply(Defaults.scala:1369)
	at scala.Function1$$anonfun$compose$1.apply(Function1.scala:47)
	at sbt.$tilde$greater$$anonfun$$u2219$1.apply(TypeFunctions.scala:40)
	at sbt.std.Transform$$anon$4.work(System.scala:63)
	at sbt.Execute$$anonfun$submit$1$$anonfun$apply$1.apply(Execute.scala:228)
	at sbt.Execute$$anonfun$submit$1$$anonfun$apply$1.apply(Execute.scala:228)
	at sbt.ErrorHandling$.wideConvert(ErrorHandling.scala:17)
	at sbt.Execute.work(Execute.scala:237)
	at sbt.Execute$$anonfun$submit$1.apply(Execute.scala:228)
	at sbt.Execute$$anonfun$submit$1.apply(Execute.scala:228)
	at sbt.ConcurrentRestrictions$$anon$4$$anonfun$1.apply(ConcurrentRestrictions.scala:159)
	at sbt.CompletionService$$anon$2.call(CompletionService.scala:28)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at java.lang.Thread.run(Thread.java:745)
[error] (*:update) java.lang.IllegalArgumentException: org.mongodb#mongo-java-driver;3.2.2!mongo-java-driver.jar origin location must be absolute: file:/Users/diggzhang/.m2/repository/org/mongodb/mongo-java-driver/3.2.2/mongo-java-driver-3.2.2.jar
[error] Total time: 0 s, completed 2016-10-14 10:40:00

```

成功load项目:

```shell
➜  casbah_tutorial git:(master) ✗ sbt console
[info] Loading global plugins from /Users/diggzhang/.sbt/0.13/plugins
[info] Updating {file:/Users/diggzhang/.sbt/0.13/plugins/}global-plugins...
[info] Resolving org.fusesource.jansi#jansi;1.4 ...
[info] Done updating.
[info] Set current project to Casbah Tutorial (in build file:/Users/diggzhang/code/newWayToWorld/casbah_tutorial/)
[info] Updating {file:/Users/diggzhang/code/newWayToWorld/casbah_tutorial/}casbah_tutorial...
[info] Resolving jline#jline;2.12.1 ...
[info] downloading https://repo1.maven.org/maven2/org/mongodb/casbah-commons_2.11/3.1.1/casbah-commons_2.11-3.1.1.jar ...
[info] 	[SUCCESSFUL ] org.mongodb#casbah-commons_2.11;3.1.1!casbah-commons_2.11.jar (2073ms)
[info] downloading https://repo1.maven.org/maven2/org/mongodb/casbah-core_2.11/3.1.1/casbah-core_2.11-3.1.1.jar ...
[info] 	[SUCCESSFUL ] org.mongodb#casbah-core_2.11;3.1.1!casbah-core_2.11.jar (2028ms)
[info] downloading https://repo1.maven.org/maven2/org/mongodb/casbah-query_2.11/3.1.1/casbah-query_2.11-3.1.1.jar ...
[info] 	[SUCCESSFUL ] org.mongodb#casbah-query_2.11;3.1.1!casbah-query_2.11.jar (1806ms)
[info] downloading https://repo1.maven.org/maven2/org/mongodb/casbah-gridfs_2.11/3.1.1/casbah-gridfs_2.11-3.1.1.jar ...
[info] 	[SUCCESSFUL ] org.mongodb#casbah-gridfs_2.11;3.1.1!casbah-gridfs_2.11.jar (1653ms)
[info] downloading https://repo1.maven.org/maven2/com/github/nscala-time/nscala-time_2.11/1.0.0/nscala-time_2.11-1.0.0.jar ...
[info] 	[SUCCESSFUL ] com.github.nscala-time#nscala-time_2.11;1.0.0!nscala-time_2.11.jar (3761ms)
[info] downloading https://repo1.maven.org/maven2/org/mongodb/mongo-java-driver/3.2.2/mongo-java-driver-3.2.2.jar ...
[info] 	[SUCCESSFUL ] org.mongodb#mongo-java-driver;3.2.2!mongo-java-driver.jar (10683ms)
[info] downloading https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.6.0/slf4j-api-1.6.0.jar ...
[info] 	[SUCCESSFUL ] org.slf4j#slf4j-api;1.6.0!slf4j-api.jar (1379ms)
[info] downloading https://repo1.maven.org/maven2/org/joda/joda-convert/1.2/joda-convert-1.2.jar ...
[info] 	[SUCCESSFUL ] org.joda#joda-convert;1.2!joda-convert.jar (1983ms)
[info] Done updating.
[info] Starting scala interpreter...
[info]
Welcome to Scala version 2.11.7 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_73).
Type in expressions to have them evaluated.
Type :help for more information.

scala>
```

#### 如何引入`casbah`:

```shell
scala> import com.mongodb.casbah.Imports._
import com.mongodb.casbah.Imports._

scala> val client = MongoClient()
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
十月 14, 2016 11:11:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Cluster created with settings {hosts=[127.0.0.1:27017], mode=SINGLE, requiredClusterType=UNKNOWN, serverSelectionTimeout='30000 ms', maxWaitQueueSize=500}
client: com.mongodb.casbah.MongoClient = com.mongodb.casbah.MongoClient@3774f2b4

scala> 十月 14, 2016 11:11:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Opened connection [connectionId{localValue:1, serverValue:251}] to 127.0.0.1:27017
十月 14, 2016 11:11:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Monitor thread successfully connected to server with description ServerDescription{address=127.0.0.1:27017, type=STANDALONE, state=CONNECTED, ok=true, version=ServerVersion{versionList=[3, 2, 8]}, minWireVersion=0, maxWireVersion=4, maxDocumentSize=16777216, roundTripTimeNanos=391071}


scala>
```

#### casbah链接到mongo

这里用`MongoClient()`连接到了本地的mongo

```shell
scala> val client = MongoClient("127.0.0.1", 27017)
十月 14, 2016 11:13:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Cluster created with settings {hosts=[127.0.0.1:27017], mode=SINGLE, requiredClusterType=UNKNOWN, serverSelectionTimeout='30000 ms', maxWaitQueueSize=500}
client: com.mongodb.casbah.MongoClient = com.mongodb.casbah.MongoClient@4f02c3a5

scala> 十月 14, 2016 11:13:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Opened connection [connectionId{localValue:2, serverValue:252}] to 127.0.0.1:27017
十月 14, 2016 11:13:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Monitor thread successfully connected to server with description ServerDescription{address=127.0.0.1:27017, type=STANDALONE, state=CONNECTED, ok=true, version=ServerVersion{versionList=[3, 2, 8]}, minWireVersion=0, maxWireVersion=4, maxDocumentSize=16777216, roundTripTimeNanos=389618}

```

#### 连接到db

用刚刚的client链接到某个db

```shell
scala> val db = client("justTest")
db: com.mongodb.casbah.MongoDB = DB{name='jestTest'}
```

#### 连接到collection

访问db里的collection

```shell

scala> val collection = db("eventv4")
collection: com.mongodb.casbah.MongoCollection = eventv4

```

#### 访问到collection里面的document

```shell
# 链接到本地数据库
scala> val client = MongoClient("127.0.0.1", 27017)
十月 14, 2016 11:13:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Cluster created with settings {hosts=[127.0.0.1:27017], mode=SINGLE, requiredClusterType=UNKNOWN, serverSelectionTimeout='30000 ms', maxWaitQueueSize=500}
client: com.mongodb.casbah.MongoClient = com.mongodb.casbah.MongoClient@4f02c3a5

scala> 十月 14, 2016 11:13:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Opened connection [connectionId{localValue:2, serverValue:252}] to 127.0.0.1:27017
十月 14, 2016 11:13:39 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Monitor thread successfully connected to server with description ServerDescription{address=127.0.0.1:27017, type=STANDALONE, state=CONNECTED, ok=true, version=ServerVersion{versionList=[3, 2, 8]}, minWireVersion=0, maxWireVersion=4, maxDocumentSize=16777216, roundTripTimeNanos=389618}

# 选中某个db
scala> val db = client("justTest")
db: com.mongodb.casbah.MongoDB = DB{name='justTest'}

# 选中某个collection
scala> val collection = db("eventv4")
collection: com.mongodb.casbah.MongoCollection = eventv4

# findOne document
scala> val oneDoc = collection.findOne
oneDoc: Option[collection.T] = Some({ "_id" : { "$oid" : "57fb3bdf6f0c4e1c76d9f7d1"} , "AAAAaaa" : "ccAAAAcbbb" , "ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36" , "serverTime" : 1476082655756})
```

#### 访问document里某个字段

```shell
scala> val thisOneDoc = oneDoc.get
thisOneDoc: collection.T = { "_id" : { "$oid" : "57fb3bdf6f0c4e1c76d9f7d1"} , "AAAAaaa" : "ccAAAAcbbb" , "ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36" , "serverTime" : 1476082655756}

scala> thisOneDoc("ua")
res1: AnyRef = Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36

scala>

```

#### 遍历某个collection

```shell
scala> import com.mongodb.casbah.Imports._
import com.mongodb.casbah.Imports._

scala> val mongoClient = MongoClient("localhost", 27017)
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
十月 14, 2016 11:29:04 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Cluster created with settings {hosts=[localhost:27017], mode=SINGLE, requiredClusterType=UNKNOWN, serverSelectionTimeout='30000 ms', maxWaitQueueSize=500}
mongoClient: com.mongodb.casbah.MongoClient = com.mongodb.casbah.MongoClient@218886fe

scala> 十月 14, 2016 11:29:04 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Opened connection [connectionId{localValue:1, serverValue:258}] to localhost:27017
十月 14, 2016 11:29:04 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Monitor thread successfully connected to server with description ServerDescription{address=localhost:27017, type=STANDALONE, state=CONNECTED, ok=true, version=ServerVersion{versionList=[3, 2, 8]}, minWireVersion=0, maxWireVersion=4, maxDocumentSize=16777216, roundTripTimeNanos=614217}


scala> val db = mongoClient("justTest")
db: com.mongodb.casbah.MongoDB = DB{name='justTest'}

scala> val coll = db("eventv4")
coll: com.mongodb.casbah.MongoCollection = eventv4

scala> val allDocs = coll
coll   collection

scala> val allDocs = coll.find()
十月 14, 2016 11:29:47 上午 com.mongodb.diagnostics.logging.JULLogger log
信息: Opened connection [connectionId{localValue:2, serverValue:259}] to localhost:27017
allDocs: coll.CursorType = non-empty iterator

scala> print(allDocs)
non-empty iterator
scala> for(doc <- allDocs) println(_)
<console>:18: error: missing parameter type for expanded function ((x$1) => println(x$1))
       for(doc <- allDocs) println(_)
                                   ^

scala> for(doc <- allDocs) println(doc)
{ "_id" : { "$oid" : "57fb3bdf6f0c4e1c76d9f7d1"} , "AAAAaaa" : "ccAAAAcbbb" , "ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36" , "serverTime" : 1476082655756}

```
