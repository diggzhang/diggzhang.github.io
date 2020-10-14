---
layout:     post
title:      "Scala中的高阶函数 lambda函数"
subtitle:   "入门scala导致抑郁症系列"
date:       2016-09-30
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - scala
---

### 前菜1:  什么是高阶函数

> wiki中定义

> 在[数学](https://www.wikiwand.com/zh/%E6%95%B0%E5%AD%A6)和[计算机科学](https://www.wikiwand.com/zh/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6)中，**高阶函数**是至少满足下列一个条件的[函数](https://www.wikiwand.com/zh/%E5%87%BD%E6%95%B0)：
>
> - 接受一个或多个函数作为输入
> - 输出一个函数
>
> 在数学中它们也叫做[算子](https://www.wikiwand.com/zh/%E7%AE%97%E5%AD%90)（运算符）或[泛函](https://www.wikiwand.com/zh/%E6%B3%9B%E5%87%BD)。[微积分](https://www.wikiwand.com/zh/%E5%BE%AE%E7%A7%AF%E5%88%86)中的[导数](https://www.wikiwand.com/zh/%E5%AF%BC%E6%95%B0)就是常见的例子，因为它映射一个函数到另一个函数。



通俗些理解就是一个函数可以把另一个函数作为参数传参，函数可以作为变量传递。从一段简单的python代码构建一个高阶函数体验一下，python内建的`abs()`取绝对值函数作为参数传递进`add()`中变成了`f()`:

```python
>>> def add(x, y, f):
...     return f(x) + f(y)
...
>>> add(-5, 9, abs)
14
```





### 前菜2： 什么是lambda函数

网上有人说，在实用界就是匿名函数，在**需要一个函数，但是又不想费神去命名一个函数**的场合下使用([知乎](https://www.zhihu.com/question/20125256))。举个实例，同样是求平方根， 因为后者多定义了一个（污染环境的）函数，尤其如果这个函数只会使用一次的话。而且第一种写法实际上更易读，因为那个映射到列表上的函数具体是要做什么，非常一目了然。如果你仔细观察自己的代码，会发现这种场景其实很常见：你在某处就真的只需要一个能做一件事情的函数而已，连它叫什么名字都无关紧要。Lambda 表达式就可以用来做这件事。

```python
>>> map( lambda x: x*x, [y for y in range(10)] )
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
>>>
>>>
>>> def sq(x):
...     return x * x
...
>>> map(sq, [y for y in range(10)])
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
>>>
```



### scala中的高阶函数

```scala
// 普通函数
scala> def foo(s: String) = { println(s) }
foo: (s: String)Unit

// 高阶函数
scala> def hf(f: String => Unit) = f("higher")
hf: (f: String => Unit)Unit
  
// 把普通函数赋值给变量f
scala> val f:String=>Unit = foo
f: String => Unit = <function1>
  
// 上面的函数类型String=>Unit 也可以写为Function1[String,Unit]
scala> val f:Function1[String,Unit] = foo
  
// 把变量 f 当作参数传递给高级函数hf
scala> hf(f)
higher
```



### scala中的lambdda形式

承接上面的用法，使用lambda表达式 `(s:String) => println(s)` 作为匿名函数传入`hf()`

```scala
scala> hf((s: String) => println(s))
```



简化lambda

```scala
scala> def hf(f: String => Unit) = f("higher")

// 省略了s的类型，这是因为在定义hf时已经声明了参数类型为String=>Unit，编译器会把lambda表达式中的入参和出参按声明的类型来对待
scala> hf(s=>println(s)) // 第1个简化版本
higher

// 采用了占位符的方式。它的形式为，对于所有的 x=>g(x) 都可以用占位符的形式写为：g(_)，相当于省去了lambda表达式的入参和箭头部分，然后用占位符表示入参
scala> hf(println(_)) // 第2个简化版本
higher

scala> hf(println _) // 第3个简化版本
higher

// 第4个版本的背后其实是编译器支持lambda的“eta转换”(hongjiang.info scala中的eta-conversion)。
// 简单的说就是对于lambda表达式中只有一个参数，并且箭头右边的逻辑是对入参执行一个函数：即 x => f(x)
// 则可以简写为f
scala> hf(println) // 第4个简化版本
higher
```



### Ref

[eta-conversion](http://stackoverflow.com/questions/2363013/in-scala-why-cant-i-partially-apply-a-function-without-explicitly-specifying-i)

[scala中的eta-conversion](http://hongjiang.info/scala-eta-conversion/)

[scala雾中风景(1): lambda表达式的缩写](http://hongjiang.info/scala-pitfalls-1/)

[Scala High Order Functions](https://www.scala-exercises.org/std_lib/higher_order_functions)

[guru99](https://www.guru99.com/scala-tutorial.html)
