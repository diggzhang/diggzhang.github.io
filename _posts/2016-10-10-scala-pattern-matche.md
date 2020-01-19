---
layout:     post
title:      "Scala模式匹配"
subtitle:   "入门scala导致抑郁症系列"
date:       2016-10-10
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - scala
---

> 本文依据hongjiang.info话说模式匹配系列而来，是个人对于scala模式匹配的学习笔记

要想理解模式匹配 `pattern-matching`，需要拆开理解

#### (全篇都是)前菜 —— 模式

模式是数据结构上，用于描述一个结构的组成。英文单词pattern和正则的含义相近，不过适用范围不仅仅局限于字符串，扩展到各种类型的数据结构。比如正则表达式里 "^A.*" 这个pattern 表示以A开头、后续一个或多个字符组成的字符串；List("A", _, _*) 也是个pattern，表示第一个元素是”A”，后续一个或多个元素的List。

直观的看几个例子:

```scala
// match...case...内匹配数组Array(1,2,3),匹配成功返回print
scala> Array(1,2,3) match { case Array(1,2,3) => println("ok") }
ok

// 将一个错误的数组match最终返回MatchError
scala> Array(1,3,3) match { case Array(1,2,3) => println("ok") }
scala.MatchError: [I@28ec166e (of class [I)
  ... 32 elided

// match一个元素1开头的数组
scala> Array(1,2,3) match { case Array(1, _*) => println("ok") }
ok

scala> Array(2,2,3) match { case Array(1, _*) => println("ok") }
scala.MatchError: [I@1eea9d2d (of class [I)
  ... 32 elided

// 指定首尾元素，中间元素任意
scala> List("A", "C", "C") match { case List("A", _, "C") => println("ok") }
ok

scala> List("A", 123, "C") match { case List("A", _, "C") => println("ok") }
ok

scala> val a = 100
a: Int = 100

scala> a match { case 100 => println("ok") }
ok

scala> a match { case _:Int => println("ok") }
ok
```

上述例子中`case`后面的都是模式，表示指定元素组成的某种类型、常量、数据类型。在scala中对pattern有明确的定义，在形式上有以下集中`pattern`:

##### 1. 常量模式(constant patterns) 包含常量变量和常量字面量

```scala
scala> val site = "alibaba.com"
site: String = alibaba.com

scala> site match { case "alibaba.com" => println("ok") }
ok

scala> val ALIBABA = "alibaba.com"
ALIBABA: String = alibaba.com

scala> def foo(s: String) { s match {case ALIBABA => println("ok") } }
foo: (s: String)Unit

scala> foo(site)
ok
```

##### 2. 变量模式(variable patterns)

注意这里如果case的模式变量名是以大写字母开头，scala会把他对待成一个常量变量，试图去找到大写字母开头的变量，否则出错。

而把要匹配的 site对象用 whateverName 变量名代替，所以它总会匹配成功。

```scala
scala> site match { case WhateverName => println(WhateverName) }
<console>:13: error: not found: value WhateverName
       site match { case WhateverName => println(WhateverName) }
                         ^
<console>:13: error: not found: value WhateverName
       site match { case WhateverName => println(WhateverName) }
                                                 ^

scala> site match { case whateverName => println(whateverName) }
alibaba.com
```

变量模式通常不会单独使用，而是在多种模式组合时使用，比如：

```scala
scala> List(1,2) match { case List(x,2) => println(x) }
1
```
里面的x就是对匹配到的第一个元素用变量x标记。


##### 3. 通配符模式(wildcard patterns)

通配符下划线`_`表示一个特殊变量或占位符。

单纯的通配符模式通常在模式匹配的最后一行出现，case _ => 它可以匹配任何对象，用于处理所有其它匹配不成功的情况。

通配符模式也常和其他模式组合使用：

```scala
scala> List(1,2,3) match { case List(_, _, 3) => println("ok") }
ok
```
上面的 List(_,_,3) 里用了2个通配符表示第一个和第二个元素，这2个元素可以是任意类型。
通配符通常用于代表所不关心的部分，它不像变量模式可以后续的逻辑中使用这个变量。

##### 4. 构造器模式(constructor patterns)

```scala
scala> :paste
// Entering paste mode (ctrl-D to finish)

trait Node
case class TreeNode(v: String, left: Node, right: Node) extends Node
case class Tree(root: TreeNode)

// Exiting paste mode, now interpreting.
// 首先定义一个二叉树
defined trait Node
defined class TreeNode
defined class Tree
// 构建一个根节点含有2个子节点的树
scala> val tree = Tree(TreeNode("root", TreeNode("left", null, null), TreeNode("right", null, null)))
tree: Tree = Tree(TreeNode(root,TreeNode(left,null,null),TreeNode(right,null,null)))

// 如果我们期望一个树的构成是根节点的左子节点值为”left”，右子节点值为”right”并且右子节点没有子节点
// 那么可以用下面的方式匹配：
scala> tree.root match {
     |   case TreeNode(_, TreeNode("left", _, _), TreeNode("right", null, null)) =>
     |     println("bingo")
     | }
bingo

```
使用构造器模式可以减少大量`if`判断代码。

##### 5. 类型模式(type patterns)

判断对象是否是某种类型

```scala
"hello" match {case _:String => println("ok") }
```

需要匹配泛型的时候需要注意:

```scala
scala> :paste
// Entering paste mode (ctrl-D to finish)

def foo(a: Any) = a match {
  case a: List[String] => println("ok")
  case _ =>
}


// Exiting paste mode, now interpreting.

<console>:12: warning: non-variable type argument String in type pattern List[String] (the underlying of List[String]) is unchecked since it is eliminated by erasure
         case a: List[String] => println("ok")
                 ^
foo: (a: Any)Unit

scala> foo(List("A"))
ok

scala> foo(List(2))
ok
```
上面的 List[String] 里的String运行时并不能检测`foo(List("A")) 和 foo(List(2))` 都可以匹配成功。

**正确的做法是： ** 通常对于泛型直接用通配符替代，上面的写为 `case a : List[_] => …`

##### 6. 变量绑定模式 (variable binding patterns)

这个和前边的变量模式有什么不同？看一下代码就清楚了。
依然是上面的TreeNode，如果我们希望匹配到左边节点值为”left”就返回这个节点的话：

```scala
scala> tree.root match {
     |   case TreeNode(_, leftNode@TreeNode("left",_,_), _) => leftNode
     | }
res3: TreeNode = TreeNode(left,null,null)

```

用@符号绑定 leftNode变量到匹配到的左节点上，只有匹配成功才会绑定。