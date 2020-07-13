---
layout:     post
title:      "使用Prometheus做大数据批处理任务的监控"
subtitle:   "大数据能不能搞搞SRE啊"
date:       2020-06-04
author:     "diggzhang"
tags:
    - prometheus
---

大数据Lambda架构整体框架，很重要的一部分就是批处理任务，这些批处理任务可能是Spark任务或Hive脚本以及各种取数逻辑，
多用于数仓任务的产出。
此类型批处理任务从时间维度上是在集中时间内执行，并有固定的任务结束时间。

相应的，产生的问题就是可能因为数据倾斜或性能问题导致原固定时间交付的任务严重延迟，且还不会报错。
本文就是想用Prometheus作为工具，提供一种针对批处理任务监控的思路。

基本逻辑结构如下：

<img src={{site.baseurl}}"/img/in-post/batch-job-monitor/batchjobalert.png" alt="batchjob">


从源头开始，批处理任务的代码需要预留好发送metics的位置。
案例中使用prometheus client去实现了`Job A`和任务内`function X`的监控。
用实际代码讲解，可先不关注具体的promtheus client方法，只注意注释和打印部分：

```python
import time
import random
from prometheus_client import Gauge, CollectorRegistry, pushadd_to_gateway

registry = CollectorRegistry()
duration = Gauge(
    'mybatchjob_duration_seconds',
    'Duration of batch job',
    registry=registry
)

try:
    # 此处实现function X代码内函数级别的计时
    with duration.time():
        print("调度任务就愉快的开始了！")
        time.sleep(random.randint(1, 10))
        #time.sleep(100)
        print("这里跑了我们的调度任务")
except:
    pass
else:
    # 任务任务准确无误的情况下，发送执行成功的信号
    last_success = Gauge(
        'mybatchjob_last_success',
        'Unixtime my batch job last succeeded',
        registry=registry
    )
    last_success.set_to_current_time()
finally:
    pushadd_to_gateway('10.8.8.61:9091', job='my_batch_job', registry=registry)
```

在函数执行完成情况下会发送度量指标`mybatchjob_duration_seconds`。
在任务正确完成情况下会发送度量指标`mybatchjob_last_success`。
指标会推送到`pushgateway`。

紧接着就是规则验算环节，收到指标后`Prometheus`的规则器就对指标进行度量。
规则如下：

```
groups:
- name: BATCHJOB_MONITOR
  rules:
    - alert: 批处理任务执行超时
      expr: mybatchjob_duration_seconds > 40
      for: 1m
      labels:
        severity: warning
      annotations:
        summary: "批处理任务执行超时"
        description: "host发现某批处理任务执行超时，预期时间在40min内，请进一步观测。"
    - alert: 批处理任务状态没有及时返回
      expr: (time() - mybatchjob_last_success{job="push_pushgateway"}) > 1000
      for: 1m
      labels:
        severity: warning
      annotations:
        summary: "批处理任务执行没有及时返回"
        description: "host发现某批处理任务执行超时，这个点差不多就该执行完了，为什么还跑着呢？请进一步观测。"
```

`mybatchjob_duration_seconds`函数级别监控，单个函数执行时长大于一定预期就触发报警规则。
`mybatchjob_last_success`整个任务级别监控，当整个任务交付时间晚于预期后就触发报警规则。

这里的`time()`函数代表当前最新时间，用最新时间减去任务交付时间就是一个间隔值，间隔值是每次任务交付之间的间隔时间。
就是通过这个间隔时间形成了监控指标的依据。


但是上面的规则判断依然是写死了一个间隔周期`1000`，一个批处理任务可能受到各种因素影响导致在任务执行正常情况，交付时间相对比平时晚一点。
如果写死报警周期，会导致无效报警产生。
这个时候最好的报警规则是，取一个相对值，用相对值作为报警触发周期。
实现是稍微复杂，但基本思路不变，
原来写死的`1000`替换为一个表达式`abs(topk(...))`该表达式就是获取过去三天的平均值，并允许15分钟波动。

具体方法如下：


```
(time() - batchjob_success{exported_job="dim_topic.sh",instance="pushgateway:9091",job="push_pushgateway"}) 
> 
abs(
  (time() - 86400 * 3) - 
    (
      topk(1, 
        avg_over_time(batchjob_success{exported_job="dim_topic.sh",instance="pushgateway:9091",job="push_pushgateway"}[3d])
      )
    )
) * 1.01
```

为了读者使用方便，我将演示代码和配置贴到了github，希望对您有用：

[https://github.com/diggzhang/prometheus_batch_job_alert](https://github.com/diggzhang/prometheus_batch_job_alert)