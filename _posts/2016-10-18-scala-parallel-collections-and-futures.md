---
layout:     post
title:      "Scala Parallel Collections and Futures"
subtitle:   "scala并发编程和Future特性"
date:       2016-10-18
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"

tags:
     - scala
---


在面临大量数据处理的时候，并发编程有助于提高程序的处理性能。利用scala的天然优势，可以轻松让代码利用多核提高执行效率。

### Parallel collections 并发处理collection

scala处理集合的算子`map, reduce, filter, groupBy`在工作的时候是可以是多线程的。

```scala
import scala.collection.parallel
```

让我们从一个例子开始了解如何并发处理collection， 我们想计算句子中每个字母的出现频率：

```scala
scala> val sentence = "The quick brown fox jumped over the lazy dog"
sentence: String = The quick brown fox jumped over the lazy dog

// 这里将一串string转换为Vector数据类型
scala> val characters = sentence.toVector
characters: Vector[Char] = Vector(T, h, e,  , q, u, i, c, k,  , b, r, o, w, n,  , f, o, x,  , j, u, m, p, e, d,  , o, v, e, r,  , t, h, e,  , l, a, z, y,  , d, o, g)

```

> Vector：Vector is a general-purpose, immutable data structure. It provides random access and updates in effectively constant time, as well as very fast append and prepend. Because vectors strike a good balance between fast random selections and fast random functional updates, they are currently the default implementation of immutable indexed sequences. It is backed by a little endian bit-mapped vector trie with a branching factor of 32. Locality is very good, but not contiguous, which is good for very large sequences.

接下来将上面的`characters`转换成`parallel vector`并发vector。可以直接转是因为`ParVector`已经隐式声明，作为一个`trait`引入到`Vector`数据类型内。

```scala
scala> val charactersPar = characters.par
charactersPar: scala.collection.parallel.immutable.ParVector[Char] = ParVector(T, h, e,  , q, u, i, c, k,  , b, r, o, w, n,  , f, o, x,  , j, u, m, p, e, d,  , o, v, e, r,  , t, h, e,  , l, a, z, y,  , d, o, g)
```

`charactersPar` 和 `characters` 两个vector的操作方法其实都一样，然而`charactersPar`里的方法都是并行执行的。这里只需要记得`ParVector`和`Vector`操作起来一毛一样，前者默认并发处理collection。做个试验:

```scala
// 表面上还是基础的fitler算子，执行起来没有任何区别
scala> val lettersPar = charactersPar.filter { _ != ' ' }
lettersPar: scala.collection.parallel.immutable.ParVector[Char] = ParVector(T, h, e, q, u, i, c, k, b, r, o, w, n, f, o, x, j, u, m, p, e, d, o, v, e, r, t, h, e, l, a, z, y, d, o, g)

// 将上面的lettersPar，map成小写字母
scala> val lowerLettersPar = lettersPar.map { _.toLower }
lowerLettersPar: scala.collection.parallel.immutable.ParVector[Char] = ParVector(t, h, e, q, u, i, c, k, b, r, o, w, n, f, o, x, j, u, m, p, e, d, o, v, e, r, t, h, e, l, a, z, y, d, o, g)

// 接下来用groupBy将字母分组
// 注意，这里返回的是ParMap[Char, ParVector[Char]]
scala> val intermediateMap = lowerLettersPar.groupBy(identity)
intermediateMap: scala.collection.parallel.immutable.ParMap[Char,scala.collection.parallel.immutable.ParVector[Char]] = ParMap(e -> ParVector(e, e, e, e), x -> ParVector(x), n -> ParVector(n), j -> ParVector(j), y -> ParVector(y), t -> ParVector(t, t), u -> ParVector(u, u), f -> ParVector(f), a -> ParVector(a), m -> ParVector(m), i -> ParVector(i), v -> ParVector(v), q -> ParVector(q), b -> ParVector(b), g -> ParVector(g), l -> ParVector(l), p -> ParVector(p), c -> ParVector(c), h -> ParVector(h, h), r -> ParVector(r, r), w -> ParVector(w), k -> ParVector(k), o -> ParVector(o, o, o, o), z -> ParVector(z), d -> ParVector(d, d))

// 然后使用mapValues拿出映射对应的值，然后求length，就到了字母的出现频率
scala> val occurenceNumber = intermediateMap.mapValues { _.length }
occurenceNumber: scala.collection.parallel.ParMap[Char,Int] = ParMap(e -> 4, x -> 1, n -> 1, j -> 1, y -> 1, t -> 2, u -> 2, f -> 1, a -> 1, m -> 1, i -> 1, v -> 1, q -> 1, b -> 1, g -> 1, l -> 1, p -> 1, c -> 1, h -> 2, r -> 2, w -> 1, k -> 1, o -> 4, z -> 1, d -> 2)
scala>

```

就是这样，悄无声息的并发了一把。

### 并发处理的坑

表面上并行处理和串行处理的算子都一样，但实际上有个坑，如果在并行处理中会导致`副作用`产生，线程执行最终结果可能就不在控制范围了，跟js的异步像极了:

```scala
scala> var count = 0
count: Int = 0

scala> (0 until 1000).par.foreach { i => count += 1 }

scala> count
res6: Int = 498

scala>
```

上面程序的本意是想急计算1到1000的和，但是最后返回结果明显错误。究竟发生了什么？我们可以这么想象，foreach是并发执行的，有多个线程共同执行`count += 1`，当线程A返回某个结果的时候count还等着+1，可是线程B还有自己的独立值也+1，两个线程的值并不是同一个值，这就造成了最终的结果不符合预期。

所以，**当函数体有副作用的时候，最好不要用`parallel`模式**。

### Future

所以到现在我很期待类似于js里`Promise`的特性，发现scala的`Future`是干这个的。用法和parallel一样简单，下面的例子对比普通获取一个web页面和使用future获取:


```scala
// 普通办法
scala> import scala.io._
import scala.io._

scala> val url = "http://jandan.net"
url: String = http://jandan.net

// 执行这一行后，稍等片刻会返回web页面的内容
scala> val response = Source.fromURL(url).mkString
response: String =
<!DOCTYPE html>
<html dir="ltr" lang="zh">
<head>
    <!-- BEGIN html head -->
<title>
煎蛋 - 地球上没有新鲜事
</title>
        <meta name="keywords" content="新鲜事,译介,冷新闻,Geek,无厘头研究,无聊图集,无聊图,杯具傻缺,发霉啦,小学堂,没品笑话集"/>
    <meta name="description" content="煎蛋以译介方式传播网络新鲜资讯"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta http-equiv="Window-target" Content="_top">
    <meta name="baidu-site-verification" content="9wC0PEtTmEqSNlOk"/>
    <meta http-equiv="mobile-agent"
          content="format=html5; url=//i.jandan.net/">
            <meta http-equiv="pragma" content="no-cache"/>
        <meta http-equiv="cache-control" content="no-transform"/>
        ...
scala>
```

```scala
// future 办法
scala> import scala.concurrent._
import scala.concurrent._

scala> import scala.util._
import scala.util._

scala> import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.ExecutionContext.Implicits.global

// 这回执行后,没有任何等待，也并没有返回页面里的信息，而是返回个Future
scala> val response = Future { Source.fromURL(url).mkString }
response: scala.concurrent.Future[String] = List()

// 稍稍修改一下，让future 10s后执行
scala> val response = Future {
     |   Thread.sleep(10000)
     |   Source.fromURL(url).mkString
     | }
response: scala.concurrent.Future[String] = List()

// isCompleted可以判断Future是否返回
scala> response.isCompleted
res15: Boolean = false

scala> response.isCompleted
res16: Boolean = false

scala> response.isCompleted
res17: Boolean = false

scala> response.isCompleted
res18: Boolean = false

scala> response.isCompleted
res19: Boolean = true

// 成功拿到返回
scala> response.value
res20: Option[scala.util.Try[String]] =
Some(Success(<!DOCTYPE html>
<html dir="ltr" lang="zh">
<head>
    <!-- BEGIN html head -->
<title>
煎蛋 - 地球上没有新鲜事
</title>
        <meta name="keywords" content="新鲜事,译介,冷新闻,Geek,无厘头研究,无聊图集,无聊图,杯具傻缺,发霉啦,小学堂,没品笑话集"/>
    <meta name="description" content="煎蛋以译介方式传播网络新鲜资讯"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta http-equiv="Window-target" Content="_top">
    <meta name="baidu-site-verification" content="9wC0PEtTmEqSNlOk"/>
    <meta http-equiv="mobile-agent"
          content="format=html5; url=//i.jandan.net/">
            <meta http-equiv="pragma" content="no-cache"/>
        <meta http-equiv="cache-control"...
scala>

```

使用`onComplete`可以一直监听`Future`：

```scala
scala> val response = Future {
     |   Thread.sleep(10000)
     |   Source.fromURL(url).mkString
     | }
response: scala.concurrent.Future[String] = List()

scala>

scala>  response.onComplete {
     |   case Success(s) => println(s)
     |   case Failure(e) => println(s"Error fetching page: $e")
     | }

scala>

scala>

scala> <!DOCTYPE html>
<html dir="ltr" lang="zh">
<head>
    <!-- BEGIN html head -->
<title>
煎蛋 - 地球上没有新鲜事
```
