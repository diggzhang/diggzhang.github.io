---
layout:     post
title:      "SQL Case When"
subtitle:   "玩点高级SQL才显得专业"
date:       2020-04-14
author:     "diggzhang"
tags:
    - sql
---

日常`case when`使用我一般会做一个简单的条件判断然后输出新列内的值

```
CASE sex
	WHEN '1' THEN '男'
	WHEN '2' THEN '女' 
	ELSE '其他' 
END
```

```
CASE 
	WHEN sex = '1' THEN '男'
	WHEN sex = '2' THEN '女' 
	ELSE '其他' 
END
```

事实上`case when`的使用不止如此，还有可以将多分支判断放到JOIN语句内，这样做可以在JOIN产生联合计算前完成分支判断，尽可能的缩减计算范围：

```
SELECT * FROM sys.indexes i
    JOIN sys.partitions p
        ON i.index_id = p.index_id 
    JOIN sys.allocation_units a
        ON a.container_id = (
        	CASE
        		WHEN a.type IN (1, 3) THEN p.hobt_id 
        		WHEN a.type IN (2) THEN p.partition_id
        		ELSE NULL
        	END
        )
```

使用`case when`务必记得要处理好`ELSE`条件，当前置`when`均不符合筛选条件且没有else的情况情况下返回值为`NULL`。

[ref: Can I use CASE statement in a JOIN condition?](https://stackoverflow.com/questions/10256848/can-i-use-case-statement-in-a-join-condition)


阿里云日志服务生产环境使用案例：对连续数据进行归类。例如，从`http_user_agent`中提取信息，归类成Android和iOS两种类型：

```
SELECT 
 CASE 
 	WHEN http_user_agent like '%android%' then 'android' 
 	WHEN http_user_agent like '%ios%' then 'ios' 
 	ELSE 'unknown' END  
 AS http_user_agent,
 count(1) as pv 
GROUP BY http_user_agent
```

注意这是非标准SQL的案例。我举这样一个例子是想进一步感受`case when`的使用时机，除了缩减计算范围，还可以在聚合计算情景下使用。
