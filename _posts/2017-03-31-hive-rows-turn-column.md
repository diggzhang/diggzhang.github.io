---
layout:     post
title:      "Hive行转列"
subtitle:   "hive系魔法"
date:       2017-03-31
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - hive
     - bigdata
---

## 需求描述

先说一下数据结构。

在Mongo中的`JSON`结构是:

```javascript
{
    "_id" : ObjectId("5705c240f648e134dc8d29a2"),
    "name" : "多边形的内外角",
    "topics" : [
        ObjectId("54cc796dabc5bbb971f99bed"),
        ObjectId("54cc797aabc5bbb971f99bee")
    ],
    "hasKeyPoint" : false
}
```

映射到hive中，里面的`topics`字段会当做数组:

|id|topics|XXX|
|:--:|:--:|:--:|
|5705c240...|["54cc796dabc5bb...","54cc797aabc5b..."]|XXX|

期望输出是将数组结构解出来，让每个`topic`和`id`一一对应，期望输出效果：

|id|topic|
|:--:|:--:|
|5705c240...|54cc796dabc5bb...|
|5705c240...|54cc797aabc5b...|


## 解决方案

这个时候其实就用到了一个概念叫 **行转列**。需要用到`Hive`的内置表生成函数（UDTF）。

```sql
select id as theme_id, topic_id
from onions.themes
lateral view explode(topics) topics as topic_id
```

这里有两个陌生的东西：

1. `lateral view`
2. `explode`

`explode()`将数组作为输入，然后将数组里的元素拆成多行输出，它被称为一个`UDTF`函数。

`lateral view`用于和内置表生成函数(UDTF)结合在一起使用。以上面的查询为例，`lateral view`首先将`explode`函数放到表每行，然后由`explode`将指定的字段`topics`拆分成多行，在此基础上`lateral view`把结果组合，以`topic_id`为别名将`topics`里面产出的东西命名，最终`lateral view`将结果一一组合，产生一个新的虚拟表。

> explode() takes in an array (or a map) as an input and outputs the elements of the array (map) as separate rows. UDTFs can be used in the SELECT expression list and as a part of LATERAL VIEW.

> Lateral view is used in conjunction(结合) with user-defined(自定义) table generating(产生的) functions such as explode(). As mentioned in Built-in(嵌入的) Table-Generating Functions, a UDTF generates zero or more output(输出) rows for each input row. A lateral view first applies the UDTF to each row of base table and then joins resulting output rows to the input rows to form a virtual(虚拟的) table having the supplied table alias(别名).

这里牵扯的UDF术语归类为表生成函数。

假设表字段中有一列叫xxx是数组数据类型， `explode(xxx)`会将记录中的xxx字段内容转换成0个或多个新的记录行。如果xxx内容为空的话，不会产生新的记录，如果xxx里有记录，将数组里的每个元素提出来，产生一行新的记录。

在我们的示例中`lateral view explode(topics) topics as topic_id`，topics是一个数组，当使用表生成函数时，Hive要求使用列表别名，`as topic_id`指定列别名`topic_id`。