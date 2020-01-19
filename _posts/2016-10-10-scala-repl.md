---
layout:     post
title:      "Scala REPL"
subtitle:   "入门scala导致抑郁症系列"
date:       2016-10-10
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - scala
---

> 本文依据hongjiang.info话说模式匹配系列而来，是个人对于scala模式匹配的学习笔记


##### tip.1

repl下无法定义package
脚本其实是在一个对象的方法中运行的，定义package自然是非法的

##### tip.2

获取jvm系统属性

```scala
scala> sys.props.foreach(println)
(env.emacs,)
(java.runtime.name,Java(TM) SE Runtime Environment)
(sun.boot.library.path,/Library/Java/JavaVirtualMachines/jdk1.8.0_73.jdk/Contents/Home/jre/lib)
(java.vm.version,25.73-b02)
(gopherProxySet,false)
.LWCToolkit)
(java.vm.info,mixed mode)
(java.version,1.8.0_73)
......
(file.separator,/)
(java.vendor.url.bug,http://bugreport.sun.com/bugreport/)
(sun.io.unicode.encoding,UnicodeBig)
(sun.cpu.endian,little)
(sun.cpu.isalist,)

```

##### tip.3

repl的字体颜色可以改变

```scala
scala> Console.GREEN //字体切换为绿色，repl背景颜色也可以改
```

##### tip.4

```
:paste 进入粘贴模式，写多行代码时候方便
```

##### tip.5

```scala
:silent 安静模式，不会输出每个表达式的类型和值；在定义变量时如果不想要输出，可以用:silent启用安静模式；退出安静模式也用:silent
```

##### tip.6

wrap mode 比如说对所有的方法在运行时wrap一个time函数以统计方法的执行时间。

##### tip.7

```scala
scala> :k Int
scala.Int's kind is A

scala> :k class Test{}
Test's kind is A

scala> :k List
scala.collection.immutable.List's kind is F[+A]

scala> :k class C[M[_]]
C's kind is X[F[A]]

scala> :k class C[M2[M1[_]]]
C's kind is Y[X[F[A]]]
```