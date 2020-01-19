---
layout:     post
title:      "Swagger写RESTful API文档的不二之选"
subtitle:   "The Swagger Editor is an open source editor to design, define and document RESTful APIs in the Swagger Specification."
date:       2017-02-16
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - Swagger
---

一直在寻找一个可以写API文档的最佳工具，只要求能清楚的表达，并希望这种描述是有规范的。当发现大家都在用`Swagger`，体验了一番，嗯，就它了。

可以在线体验一下 [Swagger Editor](http://editor.swagger.io)

`Swagger`的理念就是通过`YAML`配置编辑API文档，如果希望用`JSON`可以再加插件。

> Swagger Editor lets you edit Swagger API specifications in YAML inside your browser and to preview documentations in real time. Valid Swagger JSON descriptions can then be generated and used with the full Swagger tooling (code generation, documentation, etc).


可以把这个工具搬到本地，用`http-server`作为服务器启动:

```shell
npm install -g http-server
wget https://github.com/swagger-api/swagger-editor/releases/download/v2.10.4/swagger-editor.zip
unzip swagger-editor.zip
http-server swagger-editor
```

editor不错，可以用于编写直观的api文档，该司其他两个工具也好像很牛，值得研究。
