---
layout:     post
title:      "他们所说的泛型究竟是什么"
subtitle:   "学会泛型就起范儿了"
date:       2020-07-02
author:     "diggzhang"
tags:
    - Java
---

## 问题

人人都说Java好，要学Java得趁早。
我年近三十才痛悟要学Java，希望能有所得。

在Java中有一个概念叫泛型。
我虽然知道怎么个用法，但是其实一直没有了解这个东西的点在哪里。为什么要用个泛型呢？

如果去搜一下就会告诉你，啊，就是把类型作为参数一样传去用，这不很简单吗。
但是这个确实不是我想要的答案。

我想知道用以何处。

## 解答

现在，终于有一个具象一点的例子可以理解这个概念。比如我们想做个加法函数。很简单嘛，顺手就来：

```java
public int add(int a, int b)
```

但是这个加法函数只能处理int类型数据，换个double类型就不行了。那行，再补一个嘛：

```java
public int add(int a, int b)
public double add(double a, double b)
```

现在可以处理两种情况了，但是其实还有可能要有两个`float`相加。这就有点麻烦了，不够通用啊！
很好，意识到不够通用，就需要引入泛型`generics`了。
我们把这个加法函数重构成泛型方法：

```java
public T Add<T>(T a, T b)
```

这里的`T`就代表着你想用的数据类型。
使用泛型这个特性，就是允许你用这么一个方法就能自定义类型去使用该方法了。

在Python中不常提起这个概念是因为Python的变量签名是动态的，在程序具体执行时候才去真正调用。而不像Java在编译阶段就做好类型符号表。


## ref

[Java Generics官方解读](https://docs.oracle.com/javase/tutorial/java/generics/why.html)