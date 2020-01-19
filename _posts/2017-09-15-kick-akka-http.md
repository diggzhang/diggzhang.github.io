---
layout:     post
title:      "akka-http入门"
subtitle:   "Akka Cook"
date:       2017-09-15
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - akka
     - scala
---

Akka HTTP是Lightbend提供的HTTP服务框架，它提供全面而且简单的API来创建HTTP服务器和客户端。这里注意区分，akka-http自身的定位并不是一个"web框架"。

其实之前用稍早版本的akka-http做过线上服务，吃压能力特别强，有简单的[笔记](http://yangcongchufang.com/learning-akka-http.html)，区别于之前构建方式，本文将会用最新的akka-http中的`HttpApp trait`新特性创建一个具备路由功能的简单的http服务器。体验学习过程建议在IntelliJ IDEA中进行。具体的配置方法可以参考链接：

[GETTING STARTED WITH SCALA IN INTELLIJ](https://scala-lang.org/documentation/getting-started-intellij-track/getting-started-with-scala-in-intellij.html)

构建项目过程中需要用到包管理工具sbt，国内使用sbt下载包由于不可描述的原因比较慢，建议解决办法是：

1. 系统全局翻墙，不保证速度和下载过程稳定，需要耐心
2. 使用[repox](https://github.com/Centaur/repox)，目前国内使用sbt的首选，如果未来会经常用到sbt，建议自己搭一个

希望你可以在1~2个小时内搞定基础环境，折腾sbt的过程真的很受挫，而且在这方面一直也没有什么最优解。

## build.sbt

在IDEA里创建scala sbt项目后，会自动创建好如下的结构：

```shell
├── build.sbt
├── project
│   ├── plugins.sbt
│   ├── ......
│── src
│   ├── main
│      └── java
│      └── scala
│── target
.....

```

在`build.sbt`中添加项目依赖配置，保存后IDEA会自动下载依赖，相当于命令行下执行`sbt update`：

```scala
name := "Hello-Akka"

version := "1.0"

scalaVersion := "2.11.7"

libraryDependencies += "com.typesafe.akka" %
  "akka-http_2.11" % "10.0.5"
```

Akka是一个活跃的项目，各种激进升级，为了保证能顺利练习，一定要用相同的版本号。


## Minimal Http Server Code

接下来核心代码，在`src/main/scala`下右击`New-Package`创建一个包，这里起名叫`package com.yangcongchufang.miniserver`，然后在包下面右击`new-scala class`创建一个点选`kind`创建一个`scala object`，这里起名叫`MinimalHttpServer`。

一切都还空空如也，现在我们在`MinimalHttpServer.scala`下面完成核心代码：

```scala
package com.yangcongchufang.miniserver

object MinimalHttpServer {

}
```

来了，今天的主角新特性`HtppApp`。akka-http引入该特性的目标就是为了精简一下构建http server代码的成本，目前尚属于一个试验性的特性。在过去如果想使用路由和各种控件需要引入一堆包，如今只需要一个`akka.http.scaladsl.server.HttpApp`就够了。

```scala
package com.yangcongchufang.miniserver

import akka.http.scaladsl.server.HttpApp

object MinimalHttpServer extends HttpApp {
}

object MinimalHttpServerApplication extends App {
  MinimalHttpServer.startServer("0.0.0.0", 8099)
}

```

一鼓作气，添加路由，在这里构建了两条路由，里面有一些控件`get()/ post() / pathPrefix() / path() / complete() / entity() / Segment`都是从`HttpApp`里继承而来，根据下面的测试例子跑一遍，相信你能猜出是干什么的：

```scala
package com.yangcongchufang.miniserver

import akka.http.scaladsl.server.HttpApp

object MinimalHttpServer extends HttpApp {
  def route =
    pathPrefix("v1") {
      path("id" / Segment) { id =>
        get {
          println("server get " + id)
          complete(s"got get request")
        } ~
          post {
            entity(as[String]) { entity =>
              println("server get " + entity)
              complete(s"got post request")
            }
          }
      }
    }
}

object MinimalHttpServerApplication extends App {
  MinimalHttpServer.startServer("0.0.0.0", 8099)
}
```


启动`MinimalHttpServer.scala`，右击该文件然后`Run...`：

```
Press RETURN to stop...
[INFO] [09/15/2017 13:44:36.787] [MinimalHttpServer-akka.actor.default-dispatcher-3] [akka.actor.ActorSystemImpl(MinimalHttpServer)] Server online at http://0:0:0:0:0:0:0:0:8099/
```

直接使用`curl`测试API GET/POST /v1/id/<NUMBER> 请求，留意控制台上的所有log:

```shell
curl -X GET http://127.0.0.1:8099/v1/id/42

curl -X POST \
  http://127.0.0.1:8099/v1/id/42 \
  -d '{
	"to": "seek truth"
}'
```

截止目前，我们用`HttpApp`创建了一个简单的HTTP服务器程序，`HttpApp`特性提供了我们可能用到所有工具，它们被统称为`routing DSL`。使用`HttpApp`的过程好像一个堆积木的过程，我们用各种`DSL`最终拼凑成一个http程序。

## JSON Support

最后部分，我们希望在已经构建好的路由中添加让它支持JSON，其实`akka-http`的前辈叫`Spray`，在Spray里提供了一个json库叫`spray-json`，就靠它了。`akka-http`官方项目中没有提供JSON支持，是因为akka的团队认为特殊数据格式序列化的事情不该归他们管，但是官方推荐了`spray-json`作为json序列化库。下面介绍如何用起来这个库。

首先在`build.sbt`中添加依赖：

```scala
name := "Hello-Akka"

version := "1.0"

scalaVersion := "2.11.7"

libraryDependencies += "com.typesafe.akka" %
  "akka-http_2.11" % "10.0.5"

libraryDependencies += "com.typesafe.akka" %
  "akka-http-spray-json_2.11" % "10.0.5"
```

等待依赖下载的过程中，在`com.yangcongchufang.miniserver`包中创建`OrderModel.scala`，我们将在这个文件里声明一堆表示数据结构的子类，并且用scala语言中的`trait`特性去让主工作函数继承实现对消息的序列化和反序列化的功能。

`trait`的作用其实和Java中的`interfaces`差不多，主要是为了在类之间共享接口和字段。类和对象都可以通过`trait`扩展功能，但是`trait`本身不能被实例化。

```scala
package com.packt.chapter9

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import spray.json.DefaultJsonProtocol

case class Item(
                 id: Int,
                 quantity: Int,
                 unitPrice: Double,
                 percentageDiscount: Option[Double]
               )

case class Order(
                  id: String,
                  timestamp: Long,
                  items: List[Item],
                  deliveryPrice: Double,
                  metadata: Map[String, String]
                )

case class GrandTotal(id: String, amount: Double)

trait OrderJsonSupport extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val itemFormat = jsonFormat4(Item)
  implicit val orderFormat = jsonFormat5(Order)
  implicit val grandTotalFormat = jsonFormat2(GrandTotal)
}
```

修改httpserver，加入`OrderJsonSupport`：

```scala
package com.yangcongchufang.miniserver

import akka.http.scaladsl.server.HttpApp
import scala.util.Random._

object MinimalHttpServer extends HttpApp with OrderJsonSupport{
  def route =
    pathPrefix("v1") {
      path("id" / Segment) { id =>
        get {
          println("server get " + id)
          complete(s"got get request")
        } ~
          post {
            entity(as[String]) { entity =>
              println("server get " + entity)
              complete(s"got post request")
            }
          }
      } ~
      path("json") {
        get {
          complete {
            genRandomOrder()
          }
        } ~
        post {
          entity(as[Order]) {order =>
            complete {
              calcGrandTotal(order)
            }
          }
        }
      }
    }

  private def calcGrandTotal(o: Order) = {
    val amount = o.items.map(
      i => i.percentageDiscount.getOrElse(1.0d)
        * i.unitPrice * i.quantity).sum + o.deliveryPrice
          GrandTotal(o.id, amount)
  }

  private def genRandomOrder(): Order = {
    val items = (0 to nextInt(5)).map(i => {
      Item(i, nextInt(100), 100 * nextDouble(),
        if (nextBoolean()) Some(nextDouble()) else None)
    }).toList
    Order(nextString(4), System.currentTimeMillis(),
      items, 100 * nextDouble(), Map("notes" -> "random"))
  }
}

object MinimalHttpServerApplication extends App {
  MinimalHttpServer.startServer("0.0.0.0", 8099)
}

```

这里对`MinimalHttpServer`做的改动需要注意：

1. 使用`with OrderJsonSupport`的方式将trait接入
2. route中新加了`path("json")`，在新添的route中构建了post和get两种json路由
3. 最后`complete { }`返回里调用了两个不同的JSON处理函数

测试一下两条路由：

```shell
$ curl -X GET http://localhost:8099/v1/json

# 返回
{
    "deliveryPrice": 25.80591871167591,
    "id": "\u8970\u3977\ubb9c\u84a6",
    "items": [
        {
            "id": 0,
            "quantity": 83,
            "unitPrice": 62.42832568845077
        },
        {
            "id": 1,
            "percentageDiscount": 0.4797392901663512,
            "quantity": 14,
            "unitPrice": 87.56115612044673
        },
        {
            "id": 2,
            "quantity": 36,
            "unitPrice": 66.74811211906629
        },
        {
            "id": 3,
            "quantity": 50,
            "unitPrice": 85.1806727979387
        }
    ],
    "metadata": {
        "notes": "random"
    },
    "timestamp": 1505787587811
}

```


```shell
$ curl -X POST -H "Content-Type:application/json" --data '
{
   "deliveryPrice":95.3433758801223,
   "timestamp":1488135061123,
   "items":[
      {
         "id":0,
         "quantity":42,
         "unitPrice":65.01159569545462,
         "percentageDiscount":0.14585908649640444
      },
      {
         "id":1,
         "quantity":7,
         "unitPrice":27.047124705161696,
         "percentageDiscount":0.06400701658372476
      },
      {
         "id":2,
         "quantity":76,
         "unitPrice":24.028733083343724,
         "percentageDiscount":0.9906003213266685
      },
      {
         "id":3,
         "quantity":18,
         "unitPrice":88.77181117560474,
         "percentageDiscount":0.8203117015522584
      },
      {
         "id":4,
         "quantity":15,
         "unitPrice":29.73662623732769
      }
   ],
   "id":"randomId",
   "metadata":{
      "notes":"random"
   }
}
' http://localhost:8099/v1/json

# 返回
{"id":"randomId","amount":4071.565724845945}
```

这种处理JSON的情况是我们确认了已知的数据结构，清晰的定义了`jsonFormat4、5`，但是如果希望处理不定长的json数据结构就麻烦了，总不能为了适应各种情况，就定义`jsonFormat4~100`。相对容易的做法是使用`play.api.libs.json._`，文档写得很详细:

[Playframework Converting to a JsValue](https://www.playframework.com/documentation/2.6.x/ScalaJson#Json)

比如当我们从http消息体中取来一串json字符串，可以直接使用其提供的`Json.parse()`API将字符串转换成json：

```scala
import play.api.libs.json._

val json: JsValue = Json.parse("""
  {
    "name" : "Watership Down",
    "location" : {
      "lat" : 51.235685,
      "long" : -1.309197
    },
    "residents" : [ {
      "name" : "Fiver",
      "age" : 4,
      "role" : null
    }, {
      "name" : "Bigwig",
      "age" : 6,
      "role" : "Owsla"
    } ]
  }
  """)
```
