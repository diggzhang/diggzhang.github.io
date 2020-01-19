---
layout:     post
title:      "gorelay录制回放生产环境流量"
subtitle:   "真实流量测试不怕侧漏"
date:       2019-02-25
author:     "diggzhang"
tags:
    - golang
---

新服务上线前，最好还是用真实流量做压测。我看`goreplay`和其它的妖艳贱货不一样，独好。
此处记录使用gor/goreplay的具体测试流程，以便备忘。

具体用法的[官方参考文档](https://github.com/buger/goreplay/wiki/Saving-and-Replaying-from-file)。

## 录制流量

以线上生产环境某个端口为3000的服务为例子，在使用gor时候需要指定：

- `--input-raw` 指明流量口为3000
- `--output-file` 指定录制好的流量包叫啥名字
- `--output-file-append` 默认录制的流量包都是切割的小文件，使用该参数合并成大文件

下面的实例中，必须指定是`sudo`权限以便于监听端口，然后产生了个名叫`requests_track.gor`的流量包：

```shell
sudo ./gor --input-raw :3000 --output-file=requests_track.gor --output-file-append
```

最终将产生的gor流量包拷贝到线下，就可以做流量重放了。

## 回放流量

在线下启动好待压测的服务后，指定两个关键参数就可以开工了:

- `--input-file` 指定录制好的流量包位置
- `--output-http` 指定要回放流量到哪个服务

```shell
gor --input-file "requests_track.gor" --output-http="http://localhost:9998"
```

gor支持倍率压测，可以基于已有流量包增大流量倍率：

```shell
gor --input-file "requests_track.gor|600%" --output-http="http://localhost:9998"
```

但是会发生一些奇奇怪怪的问题，所以为了保证流量回放完整，不能无脑加倍率，需要一点点调试出适合的回放倍率:

```
2019/02/25 11:56:51 Error when sending  read tcp [::1]:60289->[::1]:9998: i/o timeout 2019-02-25 11:56:51.079047 +0800 CST m=+35.699067514
```
