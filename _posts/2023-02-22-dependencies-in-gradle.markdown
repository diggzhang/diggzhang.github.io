---
layout:     post
title:      "记录一次Spark升级调试版本依赖的经验"
subtitle:   "太痛苦了，这升级太痛苦了"
date:       2023-02-22
author:     "diggzhang"
tags:
    - gradle

---

版本调试是开发过程中必不可少的一环，尤其是在涉及到复杂依赖关系的情况下，比如Spark升级、Scala版本变化或Gradle依赖冲突等。近期工作中尝试做了一次Spark2升级到Spark3.0.X的改造。遇到了不少关于依赖管理的问题。

升级过程中，环境基本信息如下：

1. 测试系统是MacOS Intel/ MacOS M1/ CentOS 7 
2. 升级前Spark 2.4.7，Scala 2.11.12， DeltaLake 0.6.1 ...
3. 版本管理使用Gradle
4. JDK 8 

因为一个依赖包需要，项目不得不尝试升级到Spark 3.0.X。那么，问题就开始了。

主要的一个报错是 `job.java.lang.NoSuchMethodError` ，因为版本依赖变更，很多旧包调用的底层方法失效。报错摘要如下：

```
java.lang.AbstractMethodError: Method org/apache/spark/sql/delta/commands/WriteIntoDelta.org$apache$spark$sql$catalyst$plans$logical$Command$_setter_$nodePatterns_$eq(Lscala/collection/Seq;)V is abstract
```

```
failed to build the batch job.java.lang.NoSuchMethodError: scala.collection.immutable.$colon$colon.tl$1()Lscala/collection/immutable/List;
	at play.api.libs.json.jackson.JsValueDeserializer.deserialize(JacksonJson.scala:184)
```

以第一个报错摘要为例子，我以为的基本处理思路是：

1. 想去厘清Spark 和 Delta Lake 的依赖冲突
2. 找到官方文档的版本匹配说明调整版本号

但是实际上，根据官方文档调整版本号后，发现还是报错。 于是又开始尝试逐个切换版本号试错。
有趣的是，最终发现在自己本地M1机器上跑通了，但是放到CentOS下跑不通。
可见还需要考虑到芯片架构问题，确实用着不同JDK，可能在不同系统下才能暴露问题。

而我目前不得不部署的时候用一套依赖配置，本地开发的时候用一套依赖配置。

遇到的第二大类问题算Gradle依赖管理的问题，有些共同依赖隐藏到不同包内，这就导致了包名一致，但是包内方法不一致。解决主要处理思路是：

1. 根据报错看报错包名
2. 根据报错点反查依赖包是什么
3. 根据依赖包检查哪里产生了共同依赖
4. 去除共同依赖

以Gradle为例，我们发现报错来自`javax.servlet`。

使用gradle协助列出依赖树：

```
./gradlew dependencies
```

在依赖树中检索，确实存在不同版本的多次引入。于是尝试清除共同依赖，方法算用exclude，示例:

```
    implementation("org.apache.spark:spark-core_2.12:${sparkVersion}") {
        exclude group: 'javax.servlet', module: '*'
    }
```

但是清理后发现还是存在旧版本，这个时候使用 gradle dependencyInsight 命令检查依赖冲突。该命令可以列出特定依赖项的所有版本以及每个版本的依赖项，并标识可能存在的冲突:

```
#gradle dependencyInsight --dependency javax.servlet
gradle dependencyInsight --dependency <dependency-name>
```

看到清晰的依赖关系后，不得不手动将产生引用的地方全部exclude掉。

同理，因为`com.fasterxml.jackson.core`算一个相对底层的依赖，不少JSON相关的库底层都用了它。这就发生了多次引用的问题：

```
failed to build the batch job.java.lang.NoSuchMethodError: scala.collection.immutable.$colon$colon.tl$1()Lscala/collection/immutable/List;
	at play.api.libs.json.jackson.JsValueDeserializer.deserialize(JacksonJson.scala:184)
```

除了排除依赖外，也用到了强制指明依赖，在implementation后加`!!` 让全局依赖到的位置都用指定的版本：

```
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.12.3!!'
    implementation 'com.fasterxml.jackson.core:jackson-core:2.12.3!!'
```


处理依赖问题非常耗时，主要是各种等待和调试，需要耐心和时间，最终改动或许只有几行代码，可能就会被误解工作量不够，希望遇到类似问题的工程师们能被理解。