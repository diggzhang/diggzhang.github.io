---
layout:     post
title:      "MongoDB磁盘空间清理的神话"
subtitle:   "这个不行!!!"
date:       2018-03-12
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
in-post-img: "img/post-bg-unix-linux.jpg"
category: "MongoDB小司机"
tags:
     - MongoDB

---

关于`MongoDB`磁盘空间清理，一直是个痛，remove之后并不会释放磁盘空间。对于这种情况，网络上流传着一种做法是使用官方提供的`db.repairDatabase()`。听着很合理，测试一下。

于是用`2.248GB`大小数据测试一番，删除其中部分数据后，执行`db.repairDatabase()`体验一番，测试硬件环境是在macbook的SSD磁盘且整机负载很低(不会有第三方可能性影响MongoDB性能)。执行remove操作后，mongod进程后台日志输出可以看到，WiredTiger重新校验了数据之后重建所有表索引。

```
2018-03-12T17:18:20.871+0800 I STORAGE  [conn1] WiredTiger progress WT_SESSION.verify 251400
2018-03-12T17:18:23.132+0800 I STORAGE  [conn1] Verify succeeded on uri table:collection-374-5514073542394894416. Not salvaging.
lk method
2018-03-12T17:18:23.269+0800 I INDEX    [conn1] build index on: TestDB.testCollection properties: { v: 1, key: { original.platform: -1, original.enabled: -1 }, name: "original.platform_-1_original.enabled_-1", ns: "TestDB.testCollection", background: true }
```

测试结果是：仅仅 **删除0.001GB数据耗时20min**。
于我而言，如果数据量级真的太大的话，还是老老实实dump、restore吧。
