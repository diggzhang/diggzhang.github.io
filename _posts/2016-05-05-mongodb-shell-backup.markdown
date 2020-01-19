---
layout:     post
title:      "Shell + MongoDB 增量备份策略"
subtitle:   "MongoDB增量备份策略"
date:       2016-05-05
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: "MongoDB小司机"
tags:
    - shell
    - mongodb
---

> This document is not completed and will be updated anytime.

MongoDB为数据备份提供了多种可能的解决方案，但最常用的正统办法是使用`mongodump`和`mongorestore`工具相结合对数据库或者表进行批量操作。数据量较小的初期，对于整库dump的操作或许没有什么影响，但数据量成长到一定量级以后，一次dump可能消耗几十分钟，消耗CPU同时，也有可能影响到业务。在此场景基础上，我们想到结合`Shell`脚本可以实现一种增量备份方案。*实际上MongoDB企业版本身提供了增量备份工具，但本文暂避不谈。*

#### Step.1 重命名当日数据库

在MongoDB(Pri)上，利用`cronjob + mongo`完成增量备份的第一步——重命名当日的MongoDB Collection。

准备Shell脚本`backup_mongo.sh`如下:

```shell

YEAR=(`date -d -1day '+%Y'`)
MONTH=(`date -d -1day '+%m'`)
DAY=(`date -d -1day '+%d'`)

DBHOSTNAME="localhost"
DBHOSTPORT="27017"
DB_NAME="events"

# 使用echo重定向了一组字符串到 mongoRenameEvents20160504.js 文件里，生成了一个mongoshell脚本
echo "db.events.renameCollection('events_$YEAR$MONTH$DAY')" > "mongoRenameEvents"$YEAR$MONTH$DAY.js

# 接着执行脚本 rename 这一天collection并加上时间戳
mongo --host $DBHOSTNAME:$DBHOSTPORT --authenticationDatabase admin -u root -p mypassword $DB_NAME ./"mongoRenameEvents"$YEAR$MONTH$DAY.js

```

将这断脚本放到cronjob里定期到每晚上24:00执行，时间一到获得一份当天的数据库。


#### Step.2 Dump当日数据库

rename成功后，就可以执行dump操作了。依然使用shell处理，紧接着上面的脚本增加`mongodump`命令:

```shell

mongodump --host $DBHOSTNAME:$DBHOSTPORT --db $DB_NAME_EVENTS --collection "events_"$YEAR$MONTH$DAY --authenticationDatabase admin -u root -p mypassword

```

#### Restore当日数据库到备份机

dump成功后，会在当前目录产生`./dump`，之后压缩整个`./dump`目录。将压缩好的文件发往增量备份的服务器即可。

这样的按日备份策略，我们已经在生产环境经过验证，如果你不想使用原生增量工具，不妨考虑shell调用mongo的办法去实现增量备份。需要注意的是，在`mongorestore`过程中，最后数据建立索引过程中，会发现整个MongoDB处于锁死状态，所以最好restore与业务数据库分离。
