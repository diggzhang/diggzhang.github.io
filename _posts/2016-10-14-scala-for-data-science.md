---
layout:     post
title:      "使用scala做数据分析 breeze上手"
subtitle:   "scala breeze breeze-viz"
date:       2016-10-14
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
tags:
     - scala
     - breeze
---

#### 前菜 初始化

创建`build.sbt`，然后执行`sbt console`

```shell
scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
    "org.scalanlp" % "breeze_2.10" % "0.12",
    "org.scalanlp" % "breeze-natives_2.11" % "0.12"
)
```

在下载包的的时候，如果失败，有两个解决办法可以尝试，方法一是使用`reopx`，方法二是登录到` Maven Central website (http://mvnrepository.com)`去搜一下这俩包，尝试最新的版本拷贝mvn提供的sbt依赖配置。如果选择后者，下载的时候最好翻墙，可以有效提升速度。

如果遇到如下错误:

```shell
[error] (*:update) Conflicting cross-version suffixes in: com.chuusai:shapeless, org.scalanlp:breeze-macros, org.spire-math:spire, org.scalanlp:breeze, org.spire-math:spire-macros
```

这个错误的原因可能是因为强制指定版本，导致的版本冲突错误。使用`%%`去让sbt自己去适配版本。
可以尝试修改`build.sbt`如下试试:

```scala
scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
    "org.scalanlp" %% "breeze" % "0.12",
    "org.scalanlp" %% "breeze-natives" % "0.12"
)

```

如果还是下载失败的话，那恭喜你，我们遇到过相同问题，穷尽各种办法试试吧，实在不行用mvn。sbt的下载问题已经不止一次让我失眠绝望抑郁。

执行`sbt console`， 测试一下`breeze`：

```shell
scala> import breeze.linalg._
import breeze.linalg._

scala> import breeze.numerics._
import breeze.numerics._

scala> val vec = linspace(-2.0, 2.0, 100)
vec: breeze.linalg.DenseVector[Double] = DenseVector(-2.0, -1.9595959595959596, -1.9191919191919191, -1.878787878787879, -1.8383838383838385, -1.797979797979798, -1.7575757575757576, -1.7171717171717171, -1.6767676767676767, -1.6363636363636362, -1.595959595959596, -1.5555555555555556, -1.5151515151515151, -1.4747474747474747, -1.4343434343434343, -1.393939393939394, -1.3535353535353534, -1.3131313131313131, -1.2727272727272727, -1.2323232323232323, -1.1919191919191918, -1.1515151515151514, -1.1111111111111112, -1.0707070707070705, -1.0303030303030303, -0.9898989898989898, -0.9494949494949494, -0.909090909090909, -0.8686868686868685, -0.8282828282828283, -0.7878787878787878, -0.7474747474747474, -0.707070707070707, -0.6666666666666665, -0.6262626262626261, -0.5858585858585856, -0.545454...
scala> sigmoid(vec)
res0: breeze.linalg.DenseVector[Double] = DenseVector(0.11920292202211755, 0.12351078065662129, 0.12795170492445265, 0.13252816232963247, 0.13724254530265326, 0.1420971607344629, 0.14709421909266443, 0.15223582314389064, 0.15752395631140353, 0.16296047070232167, 0.16854707484446513, 0.17428532117858545, 0.18017659335766978, 0.1862220934110186, 0.1924228288368299, 0.19877959969300693, 0.20529298576176344, 0.21196333386923713, 0.21879074544665134, 0.22577506442447592, 0.23291586555544105, 0.2402124432660242, 0.24766380113907163, 0.2552686421324066, 0.26302535963951745, 0.270932029498612, 0.27898640305536465, 0.28718590138250266, 0.2955276107558948, 0.3040082794819692, 0.3126243161650686, 0.32137178949572387, 0.3302464296318116, 0.33924363123418283, 0.3483584582066727, 0.3575856501775114, ...
scala>
```

#### breeze基础数据类型

> Breeze is an extensive library providing fast and easy manipulation of arrays of data, routines for optimization, interpolation, linear algebra, signal processing, and numerical integration.

Breeze可以方便的操作一维和二维的数据结构，首先进入sbt console看下如何操作一维的向量：

```scala
scala> import breeze.linalg._
import breeze.linalg._

scala> val v = Dense
DenseMatrix   DenseVector

scala> val v = DenseVector(1.0, 2.0, 3.0)
v: breeze.linalg.DenseVector[Double] = DenseVector(1.0, 2.0, 3.0)

scala> v(0)
res6: Double = 1.0

scala> v(1)
res7: Double = 2.0
```

`element-wise operations`可以针对定义好的vector做有意思的操作:

```scala
scala> v :* 2.0  //遍历了整个v 返回*2的结果
res8: breeze.linalg.DenseVector[Double] = DenseVector(2.0, 4.0, 6.0)


scala> v :+ DenseVector(4.0, 5.0, 6.0) //对应位置的元素相加并返回
res9: breeze.linalg.DenseVector[Double] = DenseVector(5.0, 7.0, 9.0)

// 然后举个反例，给double型的vector乘个int
scala> v :* 2
<console>:22: error: could not find implicit value for parameter op: breeze.linalg.operators.OpMulScalar.Impl2[breeze.linalg.DenseVector[Double],Int,That]
       v :* 2
         ^

// 反例2 必须两个相同长度的Vector才能使用 :+ 对应相加

scala> v :+ DenseVector(8.0, 9.0)
java.lang.IllegalArgumentException: requirement failed: Vectors must have same length: x.length == y.length (2 != 3)
  at breeze.linalg.DenseVector$canDaxpy$.apply(DenseVector.scala:589)
  at breeze.linalg.DenseVector$$anon$3.apply(DenseVector.scala:581)
  at breeze.linalg.DenseVector$$anon$3.apply(DenseVector.scala:579)
  at breeze.linalg.operators.DenseVector_GenericOps$$anon$308.apply(DenseVectorOps.scala:710)
  at breeze.linalg.operators.DenseVector_GenericOps$$anon$308.apply(DenseVectorOps.scala:707)
  at breeze.linalg.ImmutableNumericOps$class.$colon$plus(NumericOps.scala:32)
  at breeze.linalg.DenseVector.$colon$plus(DenseVector.scala:51)
  ... 42 elided

scala>

// dot 运算，对应元素相乘的结果相加
scala> val v2 = DenseVector(4.0, 5.0, 6.0)
breeze.linalg.DenseVector[Double] = DenseVector(4.0, 5.0, 6.0)

scala> v dot v2
Double = 32.0

```


#### breeze的矩阵

```scala
scala> val m = DenseMatrix((1.0, 2.0, 3.0), (4.0, 5.0, 6.0))
m: breeze.linalg.DenseMatrix[Double] =
1.0  2.0  3.0
4.0  5.0  6.0

scala> 2.0 :* m
res14: breeze.linalg.DenseMatrix[Double] =
2.0  4.0   6.0
8.0  10.0  12.0

scala>
```

数据分析一家亲，各种对比看这里[Linear Algebra Cheat Sheet](https://github.com/scalanlp/breeze/wiki/Linear-Algebra-Cheat-Sheet)


#### breeze-viz

breeze套装中的`breeze-viz`可以提供数据可视化的支持。就像是python的`matplotlib`。这里简单介绍一下。首先修改`build.sbt`，引入viz依赖:

```scala

scalaVersion := "2.11.7"

libraryDependencies ++= Seq(
  "org.scalanlp" %% "breeze" % "0.11.2",
  "org.scalanlp" %% "breeze-viz" % "0.11.2",
  "org.scalanlp" %% "breeze-natives" % "0.11.2"
)

```

执行`sbt console`，等待下载依赖之后引入`plot`:

```shell
scala> import breeze.linalg._
import breeze.linalg._

scala> import breeze.plot._
import breeze.plot._

scala> import breeze.numerics._
import breeze.numerics._

```

使用`linespace`构建`vector`

```shell
scala> val x = linspace(-4.0, 4.0, 200)
x: breeze.linalg.DenseVector[Double] = DenseVector(-4.0, -3.959798994974874, -3.919597989949749, -3.879396984924623, -3.8391959798994977, -3.798994974874372, -3.758793969849246, -3.7185929648241207, -3.678391959798995, -3.6381909547738696, -3.5979899497487438, -3.557788944723618, -3.5175879396984926, -3.477386934673367, -3.4371859296482414, -3.3969849246231156, -3.35678391959799, -3.3165829145728645, -3.2763819095477387, -3.2361809045226133, -3.1959798994974875, -3.1557788944723617, -3.115577889447236, -3.0753768844221105, -3.035175879396985, -2.9949748743718594, -2.9547738693467336, -2.914572864321608, -2.8743718592964824, -2.834170854271357, -2.7939698492462313, -2.7537688442211055, -2.7135678391959797, -2.6733668341708543, -2.633165829145729, -2.592964824120603, -2.5527638190954773, ...
scala> val fx = sigmoid(x)
fx: breeze.linalg.DenseVector[Double] = DenseVector(0.01798620996209156, 0.018710200075441868, 0.019462755028493078, 0.02024495449825208, 0.02105791509528133, 0.02190279130638982, 0.022780776433359528, 0.023693103524605037, 0.02464104629636332, 0.025625920039691327, 0.026649082509210775, 0.027711934789180975, 0.02881592213210286, 0.029962534764658974, 0.031153308655375706, 0.032389826237956304, 0.03367371708377427, 0.035006658516540536, 0.03639037616166121, 0.03782664442229031, 0.0393172868735528, 0.04086417656586936, 0.04246923622775958, 0.04413443835793441, 0.04586180519591666, 0.04765340855985365, 0.04951136953961088, 0.051437858032667774, 0.053435092109777364, 0.055505337196811416, 0.05765090505869423, 0.059874152570842096, 0.06217748026307829, 0.06456333062059459, 0.067034186126191...

```

创建`figure`，新建出一个空画板。如果是macOS，会有个叫`Boot`的东西出现在进程里。

```shell
scala> val fig = Figure()
fig: breeze.plot.Figure = breeze.plot.Figure@6cbcc831
```

在画板中可以加一个`plot`进去作图

```shell
scala> val plt = fig.subplot(0)
plt: breeze.plot.Plot = breeze.plot.Plot@2b3c81bf

scala> plt += plot(x, fx)
breeze.plot.Plot = breeze.plot.Plot@63d6a0f8
```

`plot`函数的两个参数分别代表x轴和y轴。最后执行:

```shell
scala> fig.refresh()

# 也可以保存成图片,viz只支持导出成png格式
scala> fig.saveas("sigmoid.png")

```

再看刚刚的窗口，已经生成一张函数图形。 接下来尝试定制图像。先加一些东西进去:

```shell
scala> val f2x = sigmoid(2.0*x)
f2x: breeze.linalg.DenseVector[Double] = DenseVector(3.353501304664E-4...

scala> val f10x = sigmoid(10.0*x)
f10x: breeze.linalg.DenseVector[Double] = DenseVector(4.24835425529E-18...

scala> plt += plot(x, f2x, name="S(2x)")
breeze.plot.Plot = breeze.plot.Plot@63d6a0f8

scala> plt += plot(x, f10x, name="S(10x)")
breeze.plot.Plot = breeze.plot.Plot@63d6a0f8

scala> plt.legend = true

scala> fig.refresh()
```

截止这一步可以看到三条函数曲线在画板里，在画板底部还有线条的说明lable。整个坐标系还有一些空白，可以设置limit值让线条和画板完全填充:

```shell
scala> plt.xlim = (-4.0, 4.0)
plt.xlim: (Double, Double) = (-4.0,4.0)

scala> plt.yaxis
org.jfree.chart.axis.NumberAxis = org.jfree.chart.axis.NumberAxis@0

scala> import org.jfree.chart.axis.NumberTickUnit
import org.jfree.chart.axis.NumberTickUnit

scala> plt.yaxis.setTickUnit(new NumberTickUnit(0.1))

scala> import org.jfree.chart.plot.ValueMarker
import org.jfree.chart.plot.ValueMarker

scala> plt.plot.addDomainMarker(new ValueMarker(0.0))

scala> plt.plot.addRangeMarker(new ValueMarker(1.0))

scala> plt.xlabel = "x"
plt.xlabel: String = x

scala> plt.ylabel = "f(x)"
plt.ylabel: String = f(x)
```
