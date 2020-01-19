---
layout:     post
title:      "在shell中解析json"
subtitle:   "使用shell工具巧妙的解析JSON API"
date:       2018-12-12
author:     "diggzhang"
tags:
    - shell
---

## 问题

需要在shell里解一个JSON API，方法有很多，但是如果有复杂parse需求shell直接处理还是比较麻烦，所以看到下面的方法，非常好用。

将一段python脚本包到shell函数中，用python做解析，然后返回结果。

## 解决

```shell
#!/bin/bash

function jsonGet {
  python -c 'import json,sys
o=json.load(sys.stdin)
k="'$1'"
if k != "":
  for a in k.split("."):
    if isinstance(o, dict):
      o=o[a] if a in o else ""
    elif isinstance(o, list):
      if a == "length":
        o=str(len(o))
      elif a == "join":
        o=",".join(o)
      else:
        o=o[int(a)]
    else:
      o=""
if isinstance(o, str) or isinstance(o, unicode):
  print o
else:
  print json.dumps(o)
'
}

echo $(curl -s -u "X-Requested-By: ambari" -X GET -u admin:admin http://10.8.8.61:8080/api/v1/clusters/onion_test/services/HIVE) | jsonGet ServiceInfo.state
```

## Ref

[Parsing json with unix tools](https://stackoverflow.com/questions/1955505/parsing-json-with-unix-tools)