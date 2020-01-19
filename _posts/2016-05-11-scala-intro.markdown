---
layout:     post
title:      "Hello, Scala"
subtitle:   "First Steps to Scala"
date:       2016-05-11
author:     "diggzhang"
header-img: "img/in-post/post-scala-intro/scala.png"
tags:
    - Scala
---

### Step.0 入门scala期间涉及的参考资料

[Scala 课堂!
](https://twitter.github.io/scala_school/zh_cn/index.html)

[写给Python程序员的Scala入门教程](http://www.yangbajing.me/2015/11/28/%E5%86%99%E7%BB%99python%E7%A8%8B%E5%BA%8F%E5%91%98%E7%9A%84scala%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B/)

[First Steps to Scala](http://www.artima.com/scalazine/articles/steps.html)是一部关于scala入门的minibook，分12个章节介绍scala，是学习scala的入门佳作。

[SBT免翻墙手册](http://afoo.me/posts/2014-11-05-how-make-sbt-jump-over-GFW.html#%E4%B8%AA%E4%BA%BA%E7%89%88%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88) 墙内网络使用scala的build工具sbt会遇到一些坑，这篇博客的解决办法可能会帮到你。

### Step.1 Download and install Scala

Scala是一门基于JVM的语言，所以在安装Scala之前，应该保证系统环境内的Java环境ready:

```
➜  ~  java -version
java version "1.8.0_73"
Java(TM) SE Runtime Environment (build 1.8.0_73-b02)
Java HotSpot(TM) 64-Bit Server VM (build 25.73-b02, mixed mode)
➜  ~  javac -version
javac 1.8.0_73
```

Mac系统下可以直接使用`brew`安装scala:

```
$ brew update
$ brew install scala
$ brew install sbt
```
安装完成后，更新`sbtopts`配置文件:

```shell
$ echo '-J-XX:+CMSClassUnloadingEnabled\n-J-Xmx2G\n' >> /usr/local/etc/sbtopts
```

然后在终端输入`scala`进入交互界面，如见到如下交互模式，说明scala shell已经待命了:

```
$ scala
Welcome to Scala 2.11.8 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_73).
Type in expressions for evaluation. Or try :help.

scala>
```

当然还有一个简单点的办法就是直接从[Scala官方网站](http://www.scala-lang.org/)下载编译好的Scala包，解压后从`bin`目录直接执行`./scala`是一样的效果，但要记得手工写入到shell环境变量，方便调用scala shell。

这里简单介绍一下刚刚下载的`sbt`，官方介绍是`"Use Scala to define your tasks. Then run them in parallel from the shell."`，有点像是Scala的`make`工具，也像是Java技术栈里的`Maven`和`Ant`，构建项目时候会用到。但是国内使用有墙坑，我在build著名web开发框架`play`的时候用到了sbt，sbt从网络下载项目依赖包速度极慢，需要翻墙，折腾一番目前发现最好用的翻墙办法是结合`shadowsocks`使用，打开ss，执行sbt任务时候指定proxy config:

```shell
sbt -Dhttp.proxyHost=loalhost -Dhttp.proxyPort=1080
```

### Step.2 用Scala写个Hello World

紧接着开始了解一下怎么跑一个scala程序，简单直白，在scala shell里实现Hello World程序:

```scala
scala> println("Hello World");
Hello World
```

写个scala文件，并用sbt编译。新建一个名叫`HelloWorld.scala`的文件，文件名和object名同名，如下:

```scala
object HelloWorld {
    /*
     * scala HelloWorld sample
     * input:
     * output:String
     *  Hello, world!
     */

    def main(args: Array[String]) {
        println("Hello, world!")
    }
}
```

搞定上面的文件后，到了sbt编译这个程序，在同级目录下执行`sbt`，进入sbt交互shell里然后执行`run`，就见到了结果，退出sbt后会发现多了`target`文件夹，cool，至少我现在知道scala和sbt是如何协作的了:

```shell
➜  scalablog  ls
HelloWorld.scala

➜  scalablog  sbt
[info] Set current project to scalablog (in build file:/Users/diggzhang/code/scala/scalablog/)
> run
[info] Updating {file:/Users/diggzhang/code/scala/scalablog/}scalablog...
[info] Resolving org.fusesource.jansi#jansi;1.4 ...
[info] Done updating.
[info] Compiling 1 Scala source to /Users/diggzhang/code/scala/scalablog/target/scala-2.10/classes...
[info] 'compiler-interface' not yet compiled for Scala 2.10.6. Compiling...
[info]   Compilation completed in 6.334 s
[info] Running HelloWorld
Hello, world!
[success] Total time: 9 s, completed 2016-5-13 14:23:30
>

➜  scalablog  ls
HelloWorld.scala target
```

[Scala的语法风格](http://docs.scala-lang.org/style/)有些地方需要注意:

1. 大小写敏感
2. 类名的首字母大写
3. 方法名的首字母小写，小驼峰式命名
4. 程序名应该和Object名一样
5. 必须有个`main()`方法作为入口

[Scala官方文档GETTING STARTED](http://www.scala-lang.org/documentation/getting-started.html)同样值得参考，文末介绍了Scala如何像python脚本一样执行。更爽的一点是，由于基于JVM平台，默认使用unicode，scala中可以直接使用中文不会遇到python`\uxx`的情况。

[Kojo](http://www.kogics.net/kojo) is a useful tool for Scala programming in genera.

### Step.3 Scala的变量和基础数据类型

启动Scala Shell，从一个表达式说起:

```scala
scala> 1 + 1
res0: Int = 2
```

`res0`是解释器自动创建的变量名称，用来指代表达式的计算结果。它是Int类型，值为2。

然后将这个表达式赋值给一个常量`val`:

```scala
scala> val two = 1 + 1
two: Int = 2

// 直接赋值给val声明的常量抛出error
scala> two = 9
<console>:13: error: reassignment to val
       two = 9
           ^
```

如果需要修改这个名称和结果的绑定，可以选择使用`var`去声明一个变量:

```scala
scala> var name = "diggzhang"
name: String = diggzhang

// String类型赋值Int型失败
scala> name = 99
<console>:13: error: type mismatch;
 found   : Int(99)
 required: String
       name = 99
              ^

scala> name = "dig_world"
name: String = dig_world

// 顺便试试中文字符
scala> name = "掘客张"
name: String = 掘客张
```

Scala中基础数据类型有：Byte、Short、Int、Long、Float、Double，Boolean，Char、String。通过上面实例来看，不同数据类型的变量不能相互赋值。对各种量的操作有个大概了解，接下来就是量之间的运算。进入讨论运算符阶段。

Scala中的运算符其实是定义在对象上的方法（函数），这样构建的强大之处在于，可以通过函数构造一个`函数运算符`，这个特性非常的`函数式编程感`。更大的优点是可以利用这样的特性构建`DSL`。

- `==`、`!=`：比较运算
- `!`、`|`、`&`、`^`：逻辑运算
- `>>`、`<<`：位运算

### Step.4 Scala的控制语句

Scala支持四大主要控制语句，和python一样没有`swtich`:

- `if` 每个if语句都会有返回值，如果没有返回会产出一个`Any=()`，这是scala的根类型

```scala
scala> if (true) "diggzhang" else "foobar"
res0: String = diggzhang

scala> val f = if(false) "diggzhang" else "foobar"
f: String = foobar

scala> val unit = if (false) "diggzhang"
unit: Any = ()

scala> val unit2 = if (true) "realone"
unit2: Any = realone
```

- `while` 随手造个死循环

```scala
scala> while(true) {
     |     println("diggzhang");
     | }
```

- `for` for语句和其它语言不太一样，有种列表推倒的感觉在里面

```scala
scala> val list = List(1, 2, 3, 4, 5)
list: List[Int] = List(1, 2, 3, 4, 5)

scala> val listNew = for(item <- list) yield item + 1
listNew: List[Int] = List(2, 3, 4, 5, 6)

// 还可以在映射条件后加上判断条件
scala> val listThird = for(item <- list if item % 2 == 0) yield item
listThird: List[Int] = List(2, 4)

// 还有flatMap操作，将二维表摊平，这种二层循环处理的办法相当优雅
scala> val bigList = List(List(1, 2, 3), List(4, 5, 6))
bigList: List[List[Int]] = List(List(1, 2, 3), List(4, 5, 6))

scala> for {
     |     l <- bigList
     |     item <- l if item % 2 == 0
     | } yield item
res0: List[Int] = List(2, 4, 6)

scala>


// python里的range() unitl vs to 看代码涵义自然明了
scala> for (i <- (0 until 6) ) {
     |   println(i)
     | }
0
1
2
3
4
5

scala> for (i <- (0 to 6) ) {
     |   println(i)
     | }
0
1
2
3
4
5
6

scala> for (i <- (0 to 6) ) print(" " + i)
 0 1 2 3 4 5 6

```


- `match case` 取代switch的映射表

```scala
scala> def level(s: Int) = s match {
     |   case n if n >= 80 => "Good"
     |   case n if n >= 60 => "Well"
     |   case n if n <= 50 => "Awesome"
     |   case _ => "Done"
     | }
level: (s: Int)String

scala> level(99)
res0: String = Good

scala> level(1)
res1: String = Awesome

scala> level(0)
res2: String = Awesome

scala> level()
<console>:13: error: not enough arguments for method level: (s: Int)String.
Unspecified value parameter s.
       level()
            ^

scala>
```

### Step.5 Scala集合

Python中很强大的一个特性就是集合，在scala中可以一一替代:

|Python|Scala|
|:--:|:--:|
|list|List|
|tuple|Tuple[X]|
|set|Set|
|dict|Map|

首先学习`List`, List的`::`操作符采用前缀操作的方式将一个元素和List连起来，新添的元素会连在List表头:

```scala
// 首先声明一个List 这个声明方式太丑了...
scala> val list = 1 :: 2 :: 3 :: 4 :: 5 :: Nil
list: List[Int] = List(1, 2, 3, 4, 5)

// List的indexOf()方法可以找出相应元素的位置，当我尝试找一个不存在的元素时候返回了Int = -1
scala> list.indexOf(3)
res4: Int = 2

scala> list.indexOf(0)
res5: Int = -1

// 填充一个元素进去
scala> 0 :: list
res7: List[Int] = List(0, 1, 2, 3, 4, 5)

// reverse操作
scala> list.reverse
res8: List[Int] = List(5, 4, 3, 2, 1)

// filter
scala> list.filter(item => item == 3)
res9: List[Int] = List(3)

```

下面的常用，求列表的交集 并集 差集：

```scala
scala> val list2 = List(4, 5, 6, 7, 8, 9)
list2: List[Int] = List(4, 5, 6, 7, 8, 9)

//交集
scala> list.intersect(list2)
res11: List[Int] = List(4, 5)

//并集
scala> list.union(list)
res12: List[Int] = List(1, 2, 3, 4, 5, 1, 2, 3, 4, 5)

//差集
scala> list.diff(list)
res13: List[Int] = List()

scala> list.diff(list2)
res14: List[Int] = List(1, 2, 3)

```

接下来是`Tuple`元组，Scala使用`()`定义元组

```scala
scala> val tuple1 = (1, 2, 3)
tuple1: (Int, Int, Int) = (1,2,3)

// 可以使用xxx._[X]的形式来引用Tuple中某一个具体元素
scala> tuple1._2
res15: Int = 2
```

Scala中`Set`是一个不重复的集合，和Python一样。

```scala
scala> val set = Set("Python","Python","Scala","Nodejs")
set: scala.collection.immutable.Set[String] = Set(Python, Scala, Nodejs)

// 直接操作Set，给Set增加元素
scala> set + "Go"
res19: scala.collection.immutable.Set[String] = Set(Python, Scala, Nodejs, Go)

// filterNot可以方便的筛选set内的元素
scala> set filterNot (item => item == "Python")
res20: scala.collection.immutable.Set[String] = Set(Scala, Nodejs)
```

`Map`相当于Python的`dict`，声明方式有两种：

```scala
scala> val map = Map("a" -> "A", "b" -> "B")
map: scala.collection.immutable.Map[String,String] = Map(a -> A, b -> B)

scala> val map2 = Map(("b","B"),("c","C"))
map2: scala.collection.immutable.Map[String,String] = Map(b -> B, c -> C)

```

操作方式和Set类似:

```scala
scala> map + ("wow" -> "ubuntu")
res21: scala.collection.immutable.Map[String,String] = Map(a -> A, b -> B, wow -> ubuntu)

scala> map.filterNot(entry => entry._1 == "a")
res22: scala.collection.immutable.Map[String,String] = Map(b -> B)

```

可能你注意到了，没有删除。想要删除的话，只能通过`.filterNot`函数映射一个新的集合实现。

### Step.6 函数

多样的函数是Scala的强大之处，函数可以像类型一样被赋值给一个变量，也可以做为一个函数的参数被传入，甚至还可以做为函数的返回值返回。

```scala
scala> def calc(n1: Int, n2: Int): (Int, Int) = {
     |   (n1 + n2, n1 * n2)
     | }
calc: (n1: Int, n2: Int)(Int, Int)

scala> val (add, sub) = calc(5, 1)
add: Int = 6
sub: Int = 5
```

### Step.7 为什么学习Scala

第一个原因是我们的数据量级已经渐渐触碰到大数据阶段，而目前最优秀的大数据处理技术栈`Spark`是基于Scala写的。

第二个原因是著名的web开发框架`Play`，这个号称java开发者的理想web框架无疑非常诱人。

Scala并不容易掌握，我也不知道多久才能真正上手。从零开始，简单就好，进步就好。
