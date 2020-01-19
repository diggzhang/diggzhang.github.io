---
layout:     post
title:      "Hive导入CSV文件"
subtitle:   "hive系魔法"
date:       2017-04-01
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - hive
     - bigdata
---

## 需求描述

背景是处理数据需求过程中，有一个`CSV`文件想放到`Hive`里建个表做分析。

## 解决方案

第一步创建表:

```sql
CREATE TABLE guojie_vip
(
    date_time STRING,
    u_user STRING,
    start_time STRING,
    end_time STRING,
    week STRING,
    month STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';
```

第二步将准备好的`CSV`文件导入刚刚创建好的表:

```sql
LOAD DATA LOCAL INPATH '/home/master/data/guojie_vip/user_vipTime.csv' OVERWRITE INTO TABLE guojie_vip;
```
