---
layout:     post
title:      "Scala中的{} () 以及偏函数"
subtitle:   "入门scala导致抑郁症系列"
date:       2016-09-30
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - scala
---

初学scala，觉得`() `和` {}` 分的不是太清楚，从for语句的用法看来，可以实现同样的东西，如果用`println`就更觉得是一个东西。

```scala
for(item <- items)

for{
  item <- items
}

scala> println("Hello")
Hello

scala> println{"Hello"}
Hello
```



以[HongJiang.info](http://hongjiang.info/)的例子讨论学习:

```scala
scala> List(2).map( case 2 => "digg" )
<console>:1: error: illegal start of simple expression
List(2).map( case 2 => "digg" )
             ^

scala> List(2).map{ case 2 => "digg" }
res11: List[String] = List(digg)
```



我们构建了`List(2)`，将里面的元素用`map()`映射到后面的`pattern match`里，使用`()`报错了，使用`{}`返回了正确的结果。为什么会这样，需要引出偏函数(又称"部分函数")的概念。

所谓偏函数(也叫部分函数)与完全函数对应，普通的方法都是完全函数，即 `f(i:Int) = xxx` 是将所有Int类型作为参数的，是对整个Int集的映射；而偏函数则是对部分数据的映射，比如上面`{case 2=> "OK" }`就仅仅只对2做了映射。偏函数的实现都是通过模式匹配来表达的。

构建一个偏函数`p`，并map到它:

```scala
scala>  val p:PartialFunction[Int,String] = { case 2 => "OK" }
p: PartialFunction[Int,String] = <function1>

scala> List(2) map p
res21: List[String] = List(OK)
```



因为偏函数是通过 `{ case x => y }` 这种特殊的方式来描述的，上面的`{case 2=>"OK"}`就被当作了一段偏函数字面量，而偏函数背后的类型`PartialFunction[A,B]`是继承自`Function1[A,B]`的，所以将这段匿名的偏函数传给map方法是ok的。



### 偏函数到底是什么

偏**函数**是只对**函数**定义域的一个子集进行定义的**函数**，定义域X中可能存在某些值在值域Y中没有对应的值。scala中用scala.PartialFunction[-T, +S]类来表示。比如前文中这个例子就是定义了一个偏函数:

```scala
scala>  val p:PartialFunction[Int,String] = { case 2 => "OK" }
p: PartialFunction[Int,String] = <function1>
```

当你在代码中需要多次调用一个函数, 而其中的某个参数又总是一样的时候, 使用这个可以使你少敲一些代码。

所以回头看，如果想搞懂偏函数，必须先搞懂scala中的模式匹配，因为scala可以通过模式匹配来定义偏函数，多半也是用在模式匹配里了。

