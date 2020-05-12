---
layout:     post
title:      "SQL解字符串形式的JSON组成的数组"
subtitle:   "还是要多用技巧取胜"
date:       2020-05-12
author:     "diggzhang"
tags:
    - Hive
    - SQL
---

## 背景

申明：不优雅，不是最优解，被逼无奈再这样做。

你遇到这样的数据结构：

```sql
SELECT rawjsonschema
FROM event_tracking.pointpool
WHERE eventkey='clickPayOneTrial'
```

返回记录长这样：

|rawjsonschema|
|:--:|
|`[{"uid":"xmk737i0bjq","propName":"goodId"}]`|


字符串里面是一个数组，数组里面的内容是json，而我们想取出来一个json中的字段。

## 解决

假设想取出来`rawjsonschema`中的`propName`字段：

```sql
SELECT
  get_json_object(single_json_table.col, "$.propName") as col
FROM
(
SELECT
    explode (
        split(
            regexp_replace(
                substr(
                    rawjsonschema,
                    2,
                    length(rawjsonschema) - 2
                ),
                '"}","',
                '"}",,,,"'
            ),
        ',,,,')
    ) as col
FROM event_tracking.pointpool
WHERE eventkey='clickPayOneTrial'
) single_json_table
```