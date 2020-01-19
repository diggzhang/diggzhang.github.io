---
layout:     post
title:      "使用Flask构建Restful Service查询Hive"
subtitle:   "天下武功，唯快不破"
date:       2017-10-26
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
    - python
    - flask
---

## 需求背景

我们的Hive集群需要向业务方提供一个查询接口，模式大概可以概括为：

```
[请求 XX1,XX2,XX3 用户的行为信息] <---> [查询接口：解析并组织成HQL] <---> [Hive集群接收并计算]
```

所以解决方案不言自明，想着用Python的轻量级Web框架Flask去构建一个Restful的Hive查询接口。

## API设计

首先设计API的输入输出，输入部分，构建一个POST API `\hql`，消息体内提供待查询的SQL语句：

```shell
# POST /hql input hql query output hive calculation result
curl -X POST \
  http://localhost:9000/hql \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"hql": "select * from default.guojie_vip limit 3"
}'
```

期待的输出是hive执行语句的计算结果，返回结构如下：

```javascript
{
    "hive_results": [
        [
            "date",
            "user",
            "start",
            "end",
            "week",
            "month"
        ],
        [
            "2017-08-29",
            "57bc376bfe3a33e93de8be35",
            "2017-08-29",
            "2018-03-03",
            "2017-08-28",
            "2017-08-01"
        ],
        [
            "2017-08-29",
            "57e71b362ad556bd3e075bca",
            "2018-02-04",
            "2018-08-09",
            "2017-08-28",
            "2017-08-01"
        ]
    ]
}
```

## 快速尝试

构思好API后，可以利用Flask快速开始，用最小成本先实现功能验证可行性：

```python
# filename: api.py
from flask import Flask, request

from flask import Flask
from flask.ext import restful

app = Flask(__name__)
api = restful.Api(app)

class HelloWorld(restful.Resource):
    def get(self):
        return {'hello': 'world'}

api.add_resource(HelloWorld, '/')

if __name__ == '__main__':
    app.run(debug=True)
```

跑起来：

```shell
$ python api.py
* Running on http://127.0.0.1:5000/

$ curl http://127.0.0.1:5000/
{"hello": "world"}
```

通过上面的minimal示例可以掌握`Flask-RESTful API`的构建方式，关键知识点我们程序执行流程逐步解析：

1. 当`api.py`启动后，`app.run()`开始执行，在`app`内已经加载好了所有模块
2. `api = restful.Api(app)` 该行代码让app继承了做API的能力
3. `api.add_resource(HelloWorld, '/')` 中的`add_resource()`代表着继承`HelloWorld`的类,当请求`/`的时候，调用该类
4. `HelloWorld`类中定义了`def get(self)`，当向'/'发送GET请求的时候，将会返回`{'hello': 'world'}`

## 构建项目

基于最小示例，在里面的HelloWorld类加入一个POST请求，改写HelloWorld类：

```python
class HelloWorld(restful.Resource):
    def get(self):
        return {'hello': 'world'}

    def post(arg):
      req_json = request.get_json(force=True)
      hql_line = req_json['hql']
      return {"hive_line": hive_line}
```

这里从POST消息体里用`request.get_json()`获取发来的json数据，然后抽取里面的`hql`字段内容返回。希望通过这种简单的POST响应模式，你已经大体了解请求过程。

进一步学习完整项目地址： [hql_service](https://github.com/diggzhang/hql_service)

抽取项目中`API POST /hql`样例：

```python
from flask import Flask, request
from flask_restful import Resource, Api
from pyhive import hive

## hive连接器的包用 pyhive
cursor = hive.connect(host=conf.get('HIVEURI'),
                      port=conf.get('HIVEURIPORT')).cursor()


# hql执行函数
def hql_commander(cursor, hql):
  cursor.execute(hql) # 传入的sql在这里执行
  fetch_row = cursor.fetchall() # fetchall()获取执行结果
  return fetch_row

class HqlCommander(Resource):
    def post(self):
        req_json = request.get_json(force=True)
        hql_line = req_json['hql']
        results = hql_commander(cursor, hql_line)
        return {"hive_results": results}

api.add_resource(EventsCommander, '/hql')
```

至此大功告成，似乎已经实现预期功能。但部署到生产环境以后发现存在跨域问题，需要通过flask_cors配置允许跨域：

```python
from flask_cors import CORS

...
app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)
...

```
