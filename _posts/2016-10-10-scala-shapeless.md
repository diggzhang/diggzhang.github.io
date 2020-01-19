---
layout:     post
title:      "Scala方法与函数的多态"
subtitle:   "入门scala导致抑郁症系列"
date:       2016-10-10
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - scala
---

> 本文依据hongjiang.info话说模式匹配系列而来，是个人对于scala模式匹配的学习笔记

最近在`Scala`实际开发中，遇到多个API，其实处理过程都差不多，只是一些参数配置上不同。单纯的参数不同，便在实际开发中影响到了函数设计，为了一个参数，新建了个处理函数，这个绝对是不优雅的。优雅的做法其实是用到函数的多态。

先回顾一下scala里函数类型的定义:

```scala
trait Function1[-T, +R] {
  def apply(t: T): R
}
```

只要稍作修改就可以支持对入参类型支持多态，即把`apply`方法声明为参数化的：

```scala
trait PolyFunction1[R] {
    def apply[T](t : T) : R
}
```

```scala
scala> trait PolyFunction1[R] {
     |   def apply[T](t: T): R
     | }
defined trait PolyFunction1

scala> object test extends PolyFunction1[String] { def apply[T](p: T) = p.toString }
defined object test

scala> test("hello world")
res10: String = hello world

scala> test(42)
res11: String = 42

```

