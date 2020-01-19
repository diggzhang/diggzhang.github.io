---
layout:     post
title:      "使用python发送gzip压缩的request消息体"
subtitle:   "开工大吉"
date:       2019-02-22
author:     "diggzhang"
tags:
    - python
---

## 问题

在服务端支持http gzip的情况下，客户端可以发送gzip压缩的消息体。在header中指明`Content-Encoding`表明消息主题被进行了某种编码转换。

客户端可以事先声明一系列的可以支持压缩模式，与请求一齐发送。 Accept-Encoding 这个首部就是用来进行这种内容编码形式协商的：

```
Accept-Encoding: gzip, deflate
```

服务器在`Content-Encoding`响应首部提供了实际采用的压缩模式：

```
Content-Encoding: gzip
```

需要注意的是，服务器端并不强制要求一定使用何种压缩模式。采用哪种压缩方式高度依赖于服务器端的设置，及其所采用的模块。

此处参考[Content-Encoding](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Encoding)。

我想做的测试是，向支持gzip解压缩的服务器发送一个压缩请求。经过探索最终发现解决办法如下。

## 解决

测试的python版本是`3.6.0`，试图向一个restful的API发送一条gzip压缩的json消息。
特殊的是，我为了测试服务器端的性能，故意发送了较大的消息体：

```python
#!/usr/bin/env python
import io
import gzip
import json
import requests

URL = 'http://127.0.0.1:9998/api/v4/events'

DATA = {
    # from https://en.wikipedia.org/wiki/JSON
    "firstName": "John",
    "lastName": "Smith",
    "isAlive": True,
    "age": 25,
    "address": {
        "streetAddress": "21 2nd Street",
        "city": "New York",
        "state": "NY",
        "postalCode": "10021-3100"
    },
    "phoneNumbers": [
        {
            "type": "home",
            "number": "212 555-1234"
        },
        {
            "type": "office",
            "number": "646 555-4567"
        },
        {
            "type": "mobile",
            "number": "123 456-7890"
        }
    ],
    "children": [],
    "spouse": None,
}

data_list = []
for x in range(1, 10000):
    data_list.append(DATA)


def upload_gzip_json():
    gz_buffer = io.BytesIO()
    gz_file = gzip.GzipFile(mode='wb', fileobj=gz_buffer)
    gz_file.write(json.dumps(data_list).encode('utf-8'))
    gz_file.close()
    gz_data = gz_buffer.getvalue()

    response = requests.post(URL,
                             data=gz_data,
                             headers={
                                 'content-type': 'application/json',
                                 'content-encoding': 'gzip',
                             })


def main():
    upload_gzip_json()


if __name__ == '__main__':
    main()
```

上面这段代码出自项目[gzip-encoding](https://github.com/diggzhang/gzip-encoding)，该项目对服务端到客户端接收和发送gzip压缩消息体提供了完整的示例。