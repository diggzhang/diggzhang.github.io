---
layout:     post
title:      "Hive数据倾斜不要用DISTINCT"
subtitle:   "还是要多用技巧取胜"
date:       2020-05-08
author:     "diggzhang"
tags:
    - Hive
---

数仓工作中经常会遇到数据倾斜问题。
Hive中使用 distinct 计算字段枚举可能会报出内存溢出错误。
最好的解决办法还是修改distcint分而治之。

```sql
SELECT DISTINCT u_user AS id FROM metrics
```

```sql
SELECT u_user as id FROM metrics
GROUP BY u_user
```

以往操作数据时候没有太信SQL distinct 优化这套，确实在发生数据倾斜时候用这个办法更快更好，更符合MAPREDUCE思想。