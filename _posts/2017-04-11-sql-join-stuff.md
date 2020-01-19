---
layout:     post
title:      "SQL中的JOIN"
subtitle:   ""
date:       2017-04-07
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - bigdata
     - sql
---

[Ref: (stackoverflow) Difference between Inner Join & Full join Ask](http://stackoverflow.com/questions/3022713/difference-between-inner-join-full-join)

在SQL中一种有三种用于连接外部表的`JOIN`方式:

```sql
LEFT OUTER JOIN
RIGHT OUTER JOIN
FULL OUTER JOIN
```

关键字`OUTER`在不同的SQL方言中是不同的实现，可带可不带。所以`FULL JOIN`其实跟`FULL OUTER JOIN`是一个意思。`OUTER`字段可以忽略。

接下来看看这堆`JOIN`到底做了些什么。

假如我们有如下两张表信息:

```sql
 Set "A"    Set "B"

 AA         BB
--------   --------
 Item 1     Item 3
 Item 2     Item 4
 Item 3     Item 5
 Item 4     Item 6
```

表`A / B`中各自存有不同的`Item`，A中有些`Item`在B中没有，B也如此。


## LEFT JOIN

首先看一下`LEFT JOIN`，将A作为左表，B作为右表：

```sql
SELECT * FROM A LEFT JOIN B ON AA = BB
```

会得到如下结果(空的部分其实是`NULL`，示例中没有打出来):

```sql
 AA         BB
--------   --------
 Item 1
 Item 2
 Item 3     Item 3
 Item 4     Item 4
```

A表返回了所有`Item`,B表返回了对应A表相同`Item`的部分。

## RIGHT JOIN

承接上面所述，换成`RIGHT JOIN`:

```sql
SELECT * FROM A RIGHT JOIN B ON AA = BB
```

返回结果:

```sql
 AA         BB
--------   --------
 Item 3     Item 3
 Item 4     Item 4
            Item 5
            Item 6
```

B表返回全部结果，A表返回对应着B表`Item`的结果。

## FULL JOIN

然后，如果你想返回AB表所有记录，就用到了`FULL JOIN`：

```sql
SELECT * FROM A FULL JOIN B ON AA = BB
```

得出结果:

```sql
 AA         BB
--------   --------
 Item 1            <-----+
 Item 2                  |
 Item 3     Item 3       |
 Item 4     Item 4       |
            Item 5       +--- empty holes are NULL's
            Item 6       |
   ^                     |
   |                     |
   +---------------------+
```

A表和B表内容会全部返回，AB中相对应的记录会一一对应，没有对应到的记录会用`NULL`填充。

## INNER JOIN

相反如果希望取出的是AB中的交集的部分，就用到了`INNER JOIN`:

```sql
SELECT * FROM A INNER JOIN B ON AA = BB

 AA         BB
--------   --------
 Item 3     Item 3
 Item 4     Item 4
```

这样取到的只有AB中对应的`Item`，相当于取出交集运算，一一对应，不会存在NULL填充的情况。


## CROSS JOIN

`CROSS JOIN`会产生AB表的笛卡尔积，将A中的`Item`跟B中的行一一对应。

```sql
SELECT * FROM A CROSS JOIN B

 AA         BB
--------   --------
 Item 1     Item 3      ^
 Item 1     Item 4      +--- first item from A, repeated for all items of B
 Item 1     Item 5      |
 Item 1     Item 6      v
 Item 2     Item 3      ^
 Item 2     Item 4      +--- second item from A, repeated for all items of B
 Item 2     Item 5      |
 Item 2     Item 6      v
 Item 3     Item 3      ... and so on
 Item 3     Item 4
 Item 3     Item 5
 Item 3     Item 6
 Item 4     Item 3
 Item 4     Item 4
 Item 4     Item 5
 Item 4     Item 6
```

## NATURAL JOIN

最后讨论一下`NATURAL JOIN`，并没有指定需要`on`什么字段。他会自动将名称相同的列记录按行内容是否相同匹配。

```sql
SELECT * FROM A NATURAL JOIN B

 +----------+------- matches on the names, and then the data
 |          |
 v          v
 XX         XX
--------   --------
 Item 3     Item 3
 Item 4     Item 4
```

最终得出结果跟`INNER JOIN`一样。
