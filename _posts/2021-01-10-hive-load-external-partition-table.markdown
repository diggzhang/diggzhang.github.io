---
layout:     post
title:      "Hive外部表方式加载分区表"
subtitle:   "偶然要用到"
date:       2021-01-10
author:     "diggzhang"
tags:
    - Hive
---

## 问题


假设已经在HDFS存在了一个做好分区的目录，在目录下`分区方式`是通过分区字段区分，具体的数据存在于各个分区目录下：

```
/path/to/hive/table_folder/timestamp=1606694400000/part-c000.snappy.parquet
/path/to/hive/table_folder/timestamp=1606608000000/part-c001.snappy.parquet
......
```

在本例中，表文件全部存于`/path/to/hive/table_folder/`目录下，分区目录以`timestamp=`区分，里面是`parquet`文件。
我们想做的是，将整个目录作为Hive外部表载入。

## 解决 

### 1. 获取parquet文件的数据结构

首先是需要获取表结构，启动`spark-shell`加载HDFS路径，看看有哪些字段：

```scala
scala> val parquentFile = spark.read.parquet("/path/to/hive/table_folder") 
scala> parquentFile.printSchema
```

printSchema返回数据结构，修改作为建表列名使用。

### 2. 构建建表语句

完成第一步后，开始建表，这里假设已经获取表为4个列`id/event_key/cnt/timestamp`，建表为`tmp.testLoadPartionTable`：

```sql
DROP TABLE IF EXISTS tmp.testLoadPartionTable;
CREATE EXTERNAL TABLE tmp.testLoadPartionTable(
    id integer,
    event_key string,
    cnt long
)
PARTITIONED BY (timestamp long)
STORED AS PARQUET
LOCATION '/path/to/hive/table_folder';
```

### 3. 载入数据

建表完成后一次性载入目录下所有数据:

```sql
MSCK REPAIR TABLE tmp.testLoadPartionTable; 
```

数据量较大的前提下，该命令会执行较长时间。

未来如果目录下产生新的分区目录，可以手工单独导入单个分区：

```sql
ALTER TABLE tmp.testLoadPartionTable ADD PARTITION (timestamp=1606694400000) LOCATION '/path/to/hive/table_folder/timestamp=1606694400000';
```

### 4. 数据检查

最后数据导入完成后，查验数据是否加载成功：

```sql
select FROM_UNIXTIME(timestamp/1000, "yyyy-MM-dd"), count(id) from tmp.testLoadPartionTable group by timestamp order by 1;
```