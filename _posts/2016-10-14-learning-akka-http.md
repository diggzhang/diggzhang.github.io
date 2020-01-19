---
layout:     post
title:      "akka-http入门"
subtitle:   "learning akka 快速启动一个akka-http server"
date:       2016-10-14
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - akka
     - scala
---

#### build.sbt && 加载依赖启动项目

首先创建`build.sbt`，之后执行`sbt console`去load依赖，这里有个下载的坑，最简单的解决办法是在sbt下载依赖的时候系统全局翻墙：

```scala
name := "My Akka Project"

version := "1.0"

scalaVersion := "2.11.8"

lazy val akkaHttpVersion = "2.4.11"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http-experimental" % akkaHttpVersion
)
```

测试是否可以成功启动项目，import如果没有报错，说明可以开工了:

```shell
➜  akkaRestfulWebServer git:(master) ✗ sbt console
[info] Loading global plugins from /Users/diggzhang/.sbt/0.13/plugins
[info] Set current project to My Akka Project (in build file:/Users/diggzhang/code/newWayToWorld/akkaRestfulWebServer/)
[info] Starting scala interpreter...
[info]
Welcome to Scala 2.11.8 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_73).
Type in expressions for evaluation. Or try :help.

scala> :paste
// Entering paste mode (ctrl-D to finish)

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import scala.io.StdIn


// Exiting paste mode, now interpreting.

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import scala.io.StdIn

scala>
```


#### Main.scala && 跑起来

在`build.sbt`同级创建一个`Main.scala`：

```scala
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer

object HelloDSL extends App {
  // used to run the actors
  implicit val system = ActorSystem("my-system")
  // materializes underlying flow definition into a set of actors
  implicit val materializer = ActorMaterializer()

  val route =
    path("hello") {
      get {
        complete {
          "hello Akka-HTTP DSL"
        }
      }
    }

  // start the server
  val bindingFuture = Http().bindAndHandle(route, "localhost", 8080)

  // wait for the user to stop the server
  println("Press <enter> to exit.")
  Console.in.read.toChar

  // gracefully shut down the server
  import system.dispatcher
  bindingFuture
    .flatMap(_.unbind())
    .onComplete(_ => system.shutdown())
}
```

完成后执行`sbt run`:

```
➜  akkaRestfulWebServer git:(master) ✗ sbt run
[info] Loading global plugins from /Users/diggzhang/.sbt/0.13/plugins
[info] Set current project to My Akka Project (in build file:/Users/diggzhang/code/newWayToWorld/akkaRestfulWebServer/)
[info] Running HelloDSL
Press <enter> to exit.

```

这个时候如果GET方式访问`http://localhost:8080/hello`,返回里会看到`hello Akka-HTTP DSL`


#### 解读Main.scala && 了解akka-http

The first thing we do in this service is define two implicit values.
首先我们看到在`object HelloDSL extends App {}`,用`implicit`隐式声明了两个值:

```scala
  // used to run the actors
  implicit val system = ActorSystem("my-system")
  // materializes underlying flow definition into a set of actors
  implicit val materializer = ActorMaterializer()

```


`ActorSystem("XXX")`是用来定义将要用于异步的去处理各种请求。是akka世界的入口。


> Akka HTTP will convert the DSL we create into a flow definition (which is a construct of Akka Streams). This flow can be seen as a blueprint of the steps that a request takes from the beginning to the end. The implicit ActorMaterializer will convert this flow into a set of Akka actors so that multiple requests can be executed concurrently without interfering with each other, which runs on the implicitly defined ActorSystem.

然后是路由DSL，当一个request请求到服务器`/hello`，akka会首先匹配请求的URL，然后看请求的方式是不是`GET`，如果匹配到就执行`get{}`里的语句，例子中`complete`返回一串字符:

```scala
  val route =
    path("hello") {
      get {
        complete {
          "hello Akka-HTTP DSL"
        }
      }
    }

```

最后一段代码, server绑定到8080端口启动，但监听到`key press`就释放监听停止服务:

```scala
  // start the server
  val bindingFuture = Http().bindAndHandle(route, "localhost", 8080)

  // wait for the user to stop the server
  println("Press <enter> to exit.")
  Console.in.read.toChar

  // gracefully shut down the server
  import system.dispatcher
  bindingFuture
    .flatMap(_.unbind())
    .onComplete(_ => system.shutdown())
```

一个最简单的基于`akka-http`的server就是这样。
