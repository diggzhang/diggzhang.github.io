---
layout:     post
title:      "使用playframework(scala)构建一个简单的RESTful Server服务"
subtitle:   "play with scala + RESTful"
date:       2016-10-11
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - scala
     - playframework
---

##### 前菜1 基础环境准备
- IDE(prefer `IDEA`)
- jvm/scala(最好本机已经安装好scala环境)
- repox 加速包下载，[github](https://github.com/Centaur/repox)
- activator 鉴于国内网络环境最好下载offline版本，当前最新版本是`1.3.10`

下载好解压到一个具有可写权限的目录，activator会写一些文件到该目录。官方文档特殊说明了要避开解压到`/opt` `/usr/local`或类似这样需要特殊权限的目录。

```shell
# 使用proxychains-ng为下载加速，实际测试用迅雷也可以有效加速
$ proxychains4 wget https://downloads.typesafe.com/typesafe-activator/1.3.10/typesafe-activator-1.3.10.zip

# 解压后看到 activator-dist-1.3.10
activator-dist-1.3.10           typesafe-activator-1.3.10_0.zip
```

解压完成后，将该路径添加到系统环境变量，方便调用`activator`，比如`$HOME/.profile`或`~/.zshrc`，添加完成后别忘了`source`一下。

```shell
export PATH=$PATH:/your/path/to/playframework/activator-dist-1.3.10/bin/
```

还差最后一步，进入到activator的bin目录，为`activator`添加可执行权限：

```shell
$ chmod u+x /path/to/activator-x.x.x/activator
```

至此，activator准备完毕。这玩意其实就是`sbt + 各种模板`，里面绑好sbt工具和一些工程模板，并配套一个web管理界面。里面模板可以作为学校样本或直接作为工程seed去使用。

##### 前菜2 创建项目

使用钦定的`activator`，有多种创建项目的方式。可以直接执行`activator`，通过里面的引导一步一步创建项目，也可以使用命令行的方式去创建一个项目:

```shell
$ activator new

Browse the list of templates: http://lightbend.com/activator/templates
Choose from these featured templates or enter a template name:
  1) minimal-akka-java-seed
  2) minimal-akka-scala-seed
  3) minimal-java
  4) minimal-scala
  5) play-java
  6) play-scala
(hit tab to see a list of all templates)
> 6
Enter a name for your application (just press enter for 'play-scala')
> restfulPlay
OK, application "restfulPlay" is being created using the "play-scala" template.

To run "restfulPlay" from the command line, "cd restfulPlay" then:
/Users/diggzhang/code/newWayToWorld/restfulPlay/activator run

To run the test for "restfulPlay" from the command line, "cd restfulPlay" then:
/Users/diggzhang/code/newWayToWorld/restfulPlay/activator test

To run the Activator UI for "restfulPlay" from the command line, "cd restfulPlay" then:
/Users/diggzhang/code/newWayToWorld/restfulPlay/activator ui
```

指定模板创建项目:

```shell
$ activator new my-first-app play-scala
```

run一下，顺便下载依赖。开始为了加速，我打开了`repox`，反而适得其反。activator最好还是用默认的`~/.sbt/repositories`。依赖下载完成后访问`http://localhost:9000/`即可看到hello页。

```shell
$ ./bin/activator run

# ...漫长的依赖下载过程....

--- (Running the application, auto-reloading is enabled) ---

[info] p.c.s.NettyServer - Listening for HTTP on /0:0:0:0:0:0:0:0:9000

(Server started, use Ctrl+D to stop and go back to the console...)
```

##### 前菜3 Play Console

项目创建好之后，可以使用基于`sbt`的`Play console`去管理调试Play应用。进入项目目录:

```shell
$ cd /your/path/to/your/prject
$ ./bin/activator

[info] Loading global plugins from /Users/diggzhang/.sbt/0.13/plugins
[info] Loading project definition from /Users/diggzhang/code/newWayToWorld/restfulPlay/play-scala/project
[info] Set current project to play-scala (in build file:/Users/diggzhang/code/newWayToWorld/restfulPlay/play-scala/)
[play-scala] $

# 编译
[play-scala] $ compile
[success] Total time: 0 s, completed 2016-10-11 15:26:07

# 测试
[play-scala] $ test
[info] Compiling 2 Scala sources to /Users/diggzhang/code/newWayToWorld/restfulPlay/play-scala/target/scala-2.11/test-classes...
[info] ApplicationSpec:
[info] Routes
[info] application - ApplicationTimer demo: Starting application at 2016-10-11T07:26:43.939Z.
[info] application - ApplicationTimer demo: Stopping application at 2016-10-11T07:26:44.535Z after 1s.
[info] - should send 404 on a bad request
[info] HomeController
[info] application - ApplicationTimer demo: Starting application at 2016-10-11T07:26:44.653Z.
[info] application - ApplicationTimer demo: Stopping application at 2016-10-11T07:26:44.723Z after 0s.
.......

# 输入run，便可进入开发模式
[play-scala] $ run

--- (Running the application, auto-reloading is enabled) ---

[info] p.c.s.NettyServer - Listening for HTTP on /0:0:0:0:0:0:0:0:9000

(Server started, use Ctrl+D to stop and go back to the console...)

```

在开发模式下，activator会自动监听开发目录文件更动，然后启动reload

我们有时候也需要一个快速测试的地方，使用`console`可以做到:

```scala
[play-scala] $ console
[info] Starting scala interpreter...
[info]
Welcome to Scala version 2.11.7 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_73).
Type in expressions to have them evaluated.
Type :help for more information.

scala> import play.api._
import play.api._

scala> val env = Environment(new java.io.File("."), this.getClass.getClassLoader, Mode.Dev)
env: play.api.Environment = Environment(.,scala.tools.nsc.interpreter.IMain$TranslatingClassLoader@404123c3,Dev)

scala> val env = Environment(new java.io.File("."), this.getClass.getClassLoader, Mode.Dev)
env: play.api.Environment = Environment(.,scala.tools.nsc.interpreter.IMain$TranslatingClassLoader@404123c3,Dev)

scala> val context = ApplicationLoader.createContext(env)
context: play.api.ApplicationLoader.Context = Context(Ed...
scala> val loader = ApplicationLoader(context)
loader: play.api.ApplicationLoader = play.api.inject.guice.GuiceApplicationLoader@7e0d1a1d

scala> val app = loader.load(context)
[info] application - ApplicationTimer demo: Starting application at 2016-10-11T07:31:03.833Z.
app: play.api.Application = play.api.DefaultApplication@928d695

scala> Play.start(app)
[info] play.api.Play - Application started (Dev)

scala> views.html.index
index   index_Scope0

scala> views.html.index("Hello")
res1: play.twirl.api.HtmlFormat.Appendable =

<!DOCTYPE html>
<html lang="en">
    <head>
                <select onchange="document.location=this.value">
                    <option selected ...

```


##### 前菜4 Play目录结构

play的项目结构规划非常明了，我们逐个细聊

```
LICENSE   app       build.sbt libexec   project   target
README    bin       conf      logs      public    test
```

(1) `app/`

app源码都在该目录，符合基本的`MVC`结构
The app directory contains all executable artifacts: Java and Scala source code, templates and compiled assets’ sources.

```
app                      → Application sources
 └ assets                → Compiled asset sources
    └ stylesheets        → Typically LESS CSS sources
    └ javascripts        → Typically CoffeeScript sources
 └ controllers           → Application controllers
 └ models                → Application business layer
 └ views                 → Templates


 ./app
├── Filters.scala
├── Module.scala
├── controllers
│   ├── AsyncController.scala
│   ├── CountController.scala
│   └── HomeController.scala
├── filters
│   └── ExampleFilter.scala
├── services
│   ├── ApplicationTimer.scala
│   └── Counter.scala
└── views
    ├── index.scala.html
    └── main.scala.html

4 directories, 10 files
```

(2) `public/`

静态资源目录

```
./public
├── images
│   └── favicon.png
├── javascripts
│   └── hello.js
└── stylesheets
    └── main.css

3 directories, 3 files
```

(3) `conf/`

Play的所有配置文件目录

```
./conf
├── application.conf -> the main configuration file for the application, which contains configuration parameters
├── logback.xml
└── routes -> 路由配置文件

0 directories, 3 files
```

(4) `./libexec`

这个目录不是必要的，一般用来存放没有被依赖管理的jar包。有些需要的jar包放在这里，并通过配置`classpath`引入到程序中使用。

```
./libexec
└── activator-launch-1.3.9.jar

0 directories, 1 file
```

(5) `build.sbt` `project/`

Your project’s main build declarations are generally found in build.sbt at the root of the project. .scala files in the project/ directory can also be used to declare your project’s build.

The `project/` directory contains the sbt build definitions:

`plugins.sbt` defines sbt plugins used by this project
`build.properties` contains the sbt version to use to build your app.

(6) `target/`

The target directory contains everything generated by the build system. It can be useful to know what is generated here.

- `classes/` contains all compiled classes (from both Java and Scala sources).

- `classes_managed/` contains only the classes that are managed by the framework (such as the classes generated by the router or the template system). It can be useful to add this class folder as an external class folder in your IDE project.

- `resource_managed/` contains generated resources, typically compiled assets such as LESS CSS and CoffeeScript compilation results.

- `src_managed/` contains generated sources, such as the Scala sources generated by the template system.

- `web/` contains assets processed by sbt-web such as those from the app/assets and public folders.


##### 初步修改Play默认seed

当启动app后，默认显示的是welcome页，修改controllers让index默认返回一串字符

```scala
package controllers

import javax.inject._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject() extends Controller {

  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index = Action {
//    Ok(views.html.index("Your new application is ready."))
    Ok("Your new application is ready, diggzhang")
  }

}
```

定制一个自己的controllers，在`app/controllers`新建一个`Widgets.scala`，在这个控制器内的几个方法将会组成基本的`RESTFUL`操作:

```scala
package controllers

import com.sun.xml.internal.bind.v2.TODO
import play.api.mvc._

class Widgets extends Controller {
  def index = TODO
  def create = TODO
  def read(id: String) = TODO
  def update(id: String) = TODO
  def delete(id: String) = TODO
}
```

这里引入的`TODO`，意思有些像`???`，当打开浏览器访问绑定到TODO的路由，会显示一个todo页面。

承接controllers，定义`route`，routes配置文件第一列是`http method`，第二列式路由`uri`，第三列是路由对应的controller内的方法，非常直观。

指定的http请求，会依据不同的路由，指定到相应的控制器。

如果现在从浏览器访问`http://localhost:9000/api/widgets`，这个`GET /api/widgets`请求，通过routes里面的配置发现指定到Widgets controller里面的index方法。index会response一个todo页面。

```shell

# Routes
# This file defines all application routes (Higher priority routes first)
# ~~~~

# An example controller showing a sample home page
GET     /                           controllers.HomeController.index
# An example controller showing how to use dependency injection
GET     /count                      controllers.CountController.count
# An example controller showing how to write asynchronous code
GET     /message                    controllers.AsyncController.message

# Map static resources from the /public folder to the /assets URL path
GET     /assets/*file               controllers.Assets.versioned(path="/public", file: Asset)

# todo api
# This file defines all application routes (Higher priority routes first)

#GET     /                           controllers.Application.index
#GET     /cleanup                    controllers.Application.cleanup

#Widgets
GET        /api/widgets         controllers.Widgets.index
GET        /api/widget/:id      controllers.Widgets.read(id: String)
POST       /api/widget          controllers.Widgets.create
DELETE     /api/widget/:id      controllers.Widgets.delete(id: String)
PATCH      /api/widget/:id      controllers.Widgets.update(id: String)

```

每条request请求，将由`Aciton{}`来handle，比如我们可以这样定制一个自己的`Action{}`：

```scala
// example
Action {
    Ok("Hello World")
}

// controller
package controllers

import com.sun.xml.internal.bind.v2.TODO
import play.api.mvc._

class Widgets extends Controller {
  def index = Action {
    NoContent
  }
  def create = Action {
      implicit request =>
        Ok("Got requset [ " + request + " ]")
  }
  def read(id: String) = TODO
  def update(id: String) = TODO
  def delete(id: String) = TODO
}

```

这个时候用get去访问index，将会返回204。用post去请求create将会得到一串字符。
`play.api.mvc.Action`初步理解就好像一个HTTP处理器，所有http请求来了以后都交由Action去处理。`play.api.mvc.Action`是基于`play.api.mvc.Request => play.api.mvc.Result`的函数，用于处理request请求并且返回结果给客户端。
最简单的用法就是在action里直接return一个`Result`:

```scala
Action {
  Ok("Hello World")
}
```

从request中读取信息：

```scala
Action { request =>
    Ok("Got request [" + request + "]")
}

// It is often useful to mark the request parameter as implicit so it can be implicitly used by other APIs that need it:
// 隐式声明 方便其他API调用request信息
Action { implicit request =>
  Ok("Got request [" + request + "]")
}

```

最后一种使用方法是给Action指定一个`BodyParser`， 默认不指定的情况下代表`Any content body parser`:

```scala
Action(parse.json) { implicit request =>
  Ok("Got request [" + request + "]")
}
```

`Controller`的作用就是生成一个供给`Action`返回的值。控制器可以定义成类、依赖注入、对象。但是在未来版本的play框架中，可能不再支持定义成对象，官方推荐定义成类。

```scala
package controllers

import play.api.mvc._

class Application extends Controller {

  def index = Action {
    Ok("It works!")
  }

  // 带传参的方法
  def hello(name: String) = Action {
    Ok("Hello " + name)
  }

}
```

了解以上基础知识后，我们回到Widgets Controller里，改写Action玩玩，让控制器返回我们指定的http状态码，header以及定制的信息， 修改`index`：

```scala
package controllers

import akka.util.ByteString
import com.sun.xml.internal.bind.v2.TODO
import play.api.http.HttpEntity
import play.api.mvc._

class Widgets extends Controller {
  def echo = Action { implicit request =>
    Ok("Got requset [ " + request + " ]")
  }
  def index = Action {
    Result(
      header = ResponseHeader(200, Map.empty),
      body = HttpEntity.Strict(ByteString("Hello World"), Some("text/plain"))
    )
  }
  def create = TODO
  def read(id: String) = TODO
  def update(id: String) = TODO
  def delete(id: String) = TODO
}
```

使用`Result`的效果和使用`Ok('Hello World')`的效果一样。类似`Ok()`，Play还提供了如下results helper:

```scala
val ok = Ok("Hello world!")
val notFound = NotFound
val pageNotFound = NotFound(<h1>Page not found</h1>)
val badRequest = BadRequest(views.html.form(formWithErrors))
val oops = InternalServerError("Oops")
val anyStatus = Status(488)("Strange response type")
```

使用Action可以轻松重定向到任意路由，这个默认是使用了`303 SEE_OTHER`，比如下面例子里直接重定向到了某度:

```scala
package controllers

import akka.util.ByteString
import play.api.http.HttpEntity
import play.api.mvc._

class Widgets extends Controller {
  def echo = Action { implicit request =>
    Ok("Got requset [ " + request + " ]")
  }
  def index = Action {
    Redirect("http://baidu.com")
    // 也可以自定义返回码
    // Redirect("/user/home", MOVED_PERMANENTLY)
  }
  def create = TODO
  def read(id: String) = TODO
  def update(id: String) = TODO
  def delete(id: String) = TODO
}
```

对控制器了解的差不多了，接下来攻略`ROUTER`。`route`是负责将每个http request转入到`Action`的组件。一个http请求被MVC框架视作一次事件，一次事件内主要包含两个信息:

- 请求路由 比如`/api/XXX` 也包含路由里的query `/api/XXX?q=a`
- HTTP的method `GET/PUT/POST/DELETE/..`

所有的路由信息都写到`conf/routes`文件里。

`conf/routes`的文件结构不再累述。`GET, PATCH, POST, PUT, DELETE, HEAD`对应`URI`对应`Controller`，有静态路由，有动态路由:

- 静态路由写法 `GET /echo/hello controllers.Echo.hello()`
- 动态路由写法 `GET /echo/hello/:id controllers.Echo.hello_id(id: Long)`

动态路由里的`:id`其实是一个正则表达式`[^/]+`，有的时候如果需要动态路由捕捉URI不止一次的`/`，比如`GET /files/images/logo.png` `GET /files/logos/logo.png`可以使用`*`通配符：

- `GET   /files/*name          controllers.Application.download(name)`

动态路由的参数可以定制正则:

- `GET   /items/$id<[0-9]+>    controllers.Items.show(id: Long)`

routes配置的文件的第三列是


#TODO finish this blog
