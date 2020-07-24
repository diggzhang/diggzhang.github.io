---
layout:     post
title:      "MySQL中test库的权限问题"
subtitle:   "就你搞特殊！"
date:       2020-07-24
author:     "diggzhang"
tags:
    - MySQL
---

作为一个MySQL初级用户，经常被各种以为理所当然，实则完全不同的设计小坑到。
故事是这样的，我们需要配置了一个从库权限为只读，结果在自建test库下测试时候发现，
test库在明明已经设置只读的情况，依然可以写数据。
粗看以为是权限问题，各种`show grants`相关命令都用上了去排错。

经过一番推敲后发现，其实是只有`test`库有这种特殊情况。

首先`test`一般是在安装MySQL时候创建的专门供给用户去测试玩耍的定位。
这个test库的创建语句大概是这样的：

```sql
    INSERT INTO mysql.db VALUES ('%','test','','Y','Y','Y','Y',
       'Y','Y','N','Y','Y','Y','Y','Y','Y','Y','Y','N','N','Y','Y');
    INSERT INTO mysql.db VALUES ('%','test\_%','','Y','Y','Y','Y',
       'Y','Y','N','Y','Y','Y','Y','Y','Y','Y','Y','N','N','Y','Y');
```

注意到没有`test`和`test\_%`均在权限上做了特殊处理，这意味着你创建一个`test_foobar`权限机制也是和其它库表不一样的。
默认都是给到了完全读写的权限，普通用户也可以读写test类库。

这种开放式的权限也不是完全“白给没用”，确实在一些多个项目多个用户都需要找个测试库的时候用到。

但是到了生产环境，处于安全考虑就需要删掉特殊的test了。删除方式如下：

```sql
DELETE FROM mysql.db WHERE Db IN('test', 'test\_%');
```
