---
layout:     post
title:      "解决`getaddrinfo EAI_AGAIN`问题"
subtitle:   "玄幻网络问题一般都是DNS的锅"
date:       2019-12-19
author:     "diggzhang"
tags:
    - docker
---

## 问题 

在生产环境某个API的作用是接收到请求后，复写一份到阿里云的日志服务。但是实际伺服过程中发现，有些请求报错，返回错误是：

```
{ Error: getaddrinfo ENOTFOUND xxx.cn-xxx.log.aliyuncs.com xxx.cn-xxx.log.aliyuncs.com:443
    at errnoException (dns.js:50:10)
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:92:26)
  message: 'getaddrinfo ENOTFOUND ...',
  code: 'NetworkingError',
  errno: 'ENOTFOUND',
  syscall: 'getaddrinfo',
  hostname: '......',
  host: '......',
  port: '443',
  region: null,
  retryable: true,
  time: ...... }
```

这种报错时有时无。

## 分析

发生这种情况的看报错主要原因是在容器内的DNS查询失败了。

验证方法如下，首先是执行docker内的ping命令，依据返回时长判断网络稳定性：

```
docker run busybox ping -c 1000 whatyouwant.log.aliyuncs.com
```

然后通过nslookup检查域名响应：

```
docker run busybox nslookup whatyouwant.log.aliyuncs.com
Server:		X.X.X.X
Address:	X.X.X.X:53

Non-authoritative answer:
Name:	whatyouwant.log.aliyuncs.com
Address: 47.97.242.6
Name:	whatyouwant.log.aliyuncs.com
Address: 47.97.242.7

*** Can't find onion-test.cn-hangzhou.log.aliyuncs.com: No answer
```

或者返回`nslookup: can't resolve 'google.com'`。

Docker默认加载宿主机下的`/etc/resolv.conf`文件内配置的DNS服务。
宿主机中配置的DNS服务是由公司网络管理员自建的，局域网内自建DNS是为了减少不必要的网络开销。
问题显而易见了，Docker内请求的域名发往了内网自建DNS，自建DNS内没有按预期返回信息。


## 解决

解决方法是配置Docker内的DNS使用公共DNS。可以通过启动容器命令设置或直接修改Docker配置。

启动容器时指明`--dns`参数即可：

```
$ docker run --dns 10.0.0.2 busybox nslookup google.com
Server:    10.0.0.2
Address 1: 10.0.0.2
Name:      google.com
Address 1: 2a00:1450:4009:811::200e lhr26s02-in-x200e.1e100.net
Address 2: 216.58.198.174 lhr25s10-in-f14.1e100.net
```

修改Docker配置，在`/etc/docker/daemon.json`文件内配置一个公共DNS进去：

```
{
    "dns": ["10.0.0.2", "180.76.76.76"]
}
```

---

- ref: [How to fix "getaddrinfo EAI_AGAIN" error message when adding portal server in Api Connect Management 2018.2.9](https://developer.ibm.com/answers/questions/451778/how-to-fix-getaddrinfo-eai-again-error-message-whe/)
- ref: [Fix Docker's networking DNS config](https://development.robinwinslow.uk/2016/06/23/fix-docker-networking-dns/#the-permanent-system-wide-fix)