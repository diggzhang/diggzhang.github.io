---
layout:     post
title:      "MongoDB停止正在执行的查询"
subtitle:   "Kill la Kill"
date:       2017-02-28
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - MongoDB
     - Robomongo
---

当`Robomongo`异常关闭，或强制停止一个查询的时候。这个查询任务其实依然在`MongoDB`运行。这个时候需要登录到`MongoDB`服务端，手工去停止自己的异常查询：

```javascript
// db.currentOp() 获得当前的所有`in progressing`的查询，
// 在`inprog`中的`opid`传入到 `db.killOp()`中
> db.currentOp()
{
	"inprog" : [
		{
			"desc" : "conn141888",
			"threadId" : "140335799736064",
			"connectionId" : 141888,
			"client" : "127.0.0.1:53771",
			"active" : true,
			"opid" : 6892712,
			"secs_running" : 0,
			"microsecs_running" : NumberLong(12),
			"op" : "command",
			"ns" : "admin.$cmd",
			"query" : {
				"currentOp" : 1
			},
			"numYields" : 0,
			"locks" : {

			},
			"waitingForLock" : false,
			"lockStats" : {

			}
		}
	],
	"ok" : 1
}

> db.killOp(6892712)
```

手工这样做的缺点是有些繁琐，如果自己提交的垃圾任务太多，可能得一直重复劳动。于是想着封装了一个简单的killops的小函数：传入自己的IP地址，强制关停自己的异常查询。

打开家目录下的`.mongorc.js`拷贝下面的`killMyRunningOps`函数进去，重新打开`mongoshell`即可加载这个函数(`mongoshell`启动时会预读这个文件)。

```shell
➜  ~ cat ~/.mongorc.js
```

```javascript
killMyRunningOps = function (clientIp) {
    var currOp = db.currentOp();
    for (op in currOp.inprog) {
        if (clientIp == currOp.inprog[op].client.split(":")[0]) {
            db.killOp(currentOp.inprog[op].opid)
        }
    }
}
```

用法很简单，知道自己IP后，调用这个函数：

```javascript
> killMyRunningOps("12.23.32.21")
```

这里录制了一段使用示例:
https://asciinema.org/a/8l994taroaox0ycjip1npy52j
