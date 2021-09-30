---
layout:     post
title:      "Spark写PostgreSQL"
subtitle:   "麻了"
date:       2021-09-30
author:     "diggzhang"
tags:
    - spark
---

## 需求

Spark如何将Parquet文件转写到PostgreSQL?

## 解决

这里使用spark-shell示例，启动时候加载`postgresql-42.2.8.jar`:


```shell
./bin/spark-shell --master local --jars /path/to/libs/postgresql-42.2.8.jar
```

具体逻辑如下。需要说明的是，`spark.sql.debug.maxToStringFields`配置是为了应对列数较多的情况。在`persistentIntoPG`方法内，`importDf.drop("")`是将列名为`""`列过滤掉，如果不滤掉会导致写入PG时报错`ERROR:  zero-length delimited identifier at or near """"`。


```scala
import java.util.Properties
import org.apache.spark.sql.{DataFrame, SaveMode, SparkSession}

val spark_session = SparkSession
        .builder()
        .master("local[3]")
        .appName("test")
        .config("spark.debug.maxToStringFields", "230")
        .getOrCreate();


// 指明表名
val table_name = "public.user_event"
// 指明文件路径
val path = "/data/user_event"
val import_src = "file://" + path
val postgres_url = "jdbc:postgresql://localhost:5432/sample_database?"


def readFromHDFS(file_location: String, spark_session: SparkSession) = spark_session.read.format("parquet").load(file_location)


val importDf = readFromHDFS(import_src, spark_session)
importDf.printSchema

def persistentIntoPG(postgres_url: String, importDf: DataFrame, spark_session: SparkSession) = {
    val connection_props = new Properties()
    connection_props.setProperty("driver", "org.postgresql.Driver")
    connection_props.setProperty("user", "thisuser")
    connection_props.setProperty("password", "thispassword")
    importDf.drop("").write.mode(SaveMode.Overwrite).jdbc(postgres_url, table_name, connection_props)
}


persistentIntoPG(postgres_url, importDf, spark_session)

```