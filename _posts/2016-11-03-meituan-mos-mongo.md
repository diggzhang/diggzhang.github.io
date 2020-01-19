---
layout:     post
title:      "美团云MOS大数据服务试用体验"
subtitle:   "来啊，各种云，我们正面gang"
date:       2016-11-07
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"

tags:
     - 美团云
     - mos
     - mongodb
---

公司一直使用阿里云主机和mongodb服务，但因最近业务发展需要，再加上阿里云的磁盘`IO`性能弊病，开始考虑美团云，使用云计算的方式完成分析需求。我们首先针对美团云的服务做了一轮测试。

产品的需求是： 针对MongoDB数据库，使用美团云做大数据分析。很多分析人员，或者说历来的分析人员，更习惯去使用SQL去做数据分析。美团云大数据服务恰好命中了我们的需求，我们的分析人员希望使用SQL分析MongoDB数据。

#### 账号体系

美团云的账号体系和美团账户通过手机号关联，为此我们还专门准备了一个公司的手机号。有个账号想换绑邮箱的时候，发现美团网站的“换绑”点击后无效。

企业账号认证后，会有200元的试用券。联系销售人员还有1000元豪礼供测。

#### 文档和工单系统

官方“技术支持”文档没有阿里云那么全，不过这样优点就是文档都是介绍性的东西，一些工具使用说明也简单直白，有些技术细节提工单可以快速解决，响应时间在`20min`内的样子。

#### 测试功能 数据平台 大数据计算

大数据计算提供三种类型的节点配置，我们根据实际测试量选择了基础配置：

```
3节点 云主机
基础型配置 CPU:4 核 | 内存 8G | 磁盘400G
```

我们初步测试的数据量是`100GB`的MongoDB数据内容，后续会针对这组数据做几个常规的数据需求。首先导入这100G数据就成了一个问题，使用大数据计算产品服务的话，提供了 **BDS Relay** 作为HDFS集群的文件导入导出服务。

首先SSH登录BDS Relay，登录`［控制台］－>［API］`，获得账户`AccessKey`和`Access Secret`, 作为登录Relay的用户名和密码:

```
➜  ~  ssh aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXc@mdsrelay.meituan.com
The authenticity of host 'mdsrelay.meituan.com (36.110.144.100)' can't be established.
RSA key fingerprint is SHA256:m3H/2OB1aym80BfqcoEE27uldW5I+nVl+ZYz2XYaPBQ.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'mdsrelay.meituan.com,36.110.144.100' (RSA) to the list of known hosts.
aXXXXXXXXXXXXXXXXXXXXXXXXXXXX9@mdsrelay.meituan.com's password:
**** Welcome to MOS SSH Relay ****
Supported commands:
    exit
        Exit from relay
    bds
        List running BDS(Hadoop) clusters
    sds
        List running SDS(Storm + Kafka) clusters
    ssh < bds | sds > cluster-name
        SSH to a bds/sds cluster
    connections
        List connections
    help
        Show this help
MOS>>

```

文件太大了，scp过程会出现`broken pipe`这种情况，建议使用`rsync`这样可以做到断点续传。

```
/Volume/dataDevTestMeituan# scp ./eventV4.bson a034327bec6b465a868541a44765057c@mdsrelay.meituan.com:/data-test/
drwxr-xr-x    3 master master  4.0K Sep 29 10:15 Scripts
drwx------    2 master master  4.0K May  6 17:49 .ssh
data-test/
drwxr-xr-x    3 master master  4.0K Oct 11 11:01 study
drwxr-xr-x    3 master master  4.0K Jul 12 10:52 .tldr
data-test/
a034327bec6b465a868541a4476505@mdsrelay.meituan.com's password:
eventV4.bson                                                        13%   16GB   9.2MB/s 3:10:00 ETApacket_write_wait: Connection to 36.110.144.100 port 22: Broken pipe


# rsync -v -P -e ssh ./eventV4.bson a034327bec6b465a868541a44765057c@mdsrelay.meituan.com:/data-test/

```

即使如此，也会遇到`broken pipe`大文件网络传输极不稳定。联系美团云客服，可以提供人肉传输服务，准备好`ext3`文件格式的硬盘邮寄过去就好。于是我们祭出600G数据，准备测个痛快。

#### 将BSON数据加入hive表

好吧几经周折，总算把BSON文件弄到了美团云上，接下来就是用hive去读存在hdfs上的BSON文件。命令输入`hive`后，登入hive命令行,第一步需要创建一个hive表：

```sql

> CREATE TABLE eventv4
( id STRUCT<oid:STRING, bsontype:INT>,
  eventKey STRING,
  category STRING,
  device STRING,
  uuid STRING,
  role STRING,
  eventTime BIGINT,
  subject STRING,
  channel STRING,
  os STRING,
  platform STRING,
  location STRING
  d_os_name STRING,
  netConfig STRING,
  d_appVersion STRING,
  u_phone STRING,
  u_publisher STRING,
  u_semester STRING,
  user STRING,
  u_channel STRING,
  u_type STRING,
  u_power STRING,
  u_name STRING,
  u_from STRING,
  u_isBigSwitch STRING,
  u_isVIP STRING,
  u_level STRING,
  u_nickname STRING,
  u_route STRING,
  ability STRING
)
ROW FORMAT SERDE
'com.mongodb.hadoop.hive.BSONSerDe'
WITH SERDEPROPERTIES(
    'mongo.columns.mapping'='{
        "id":"_id"
        "eventkey": "eventKey",
        "eventtime": "eventTime",
        "servertime": "serverTime",
        "netconfig": "netConfig",
        "d_appversion": "d_appVersion",
        "u_isbigswitch": "u_isBigSwitch",
        "u_isvip": "u_isVIP"
    }'
)
STORED AS INPUTFORMAT
    'com.mongodb.hadoop.mapred.BSONFileInputFormat'
OUTPUTFORMAT
    'com.mongodb.hadoop.hive.output.HiveBSONFileOutputFormat';

```

这里的表结构里的`_id`处理办法和其它字段不一样，需要在后续的sql语句里声明映射。之后load bson文件：

```sql
> LOAD DATA INPATH '/tmp/path/to/events.bson' OVERWRITE INTO TABLE eventsV4
```

截止这一步已经可以从mos的控制台里看到创建好的表和数据内容，美团云提供`Hue`作为管理和数据分析界面。搞清一些基本的概念和操作后，其实整个过程还是比较简单的，不过是传数据到hdfs，然后hive创建表，hive里再load bsonfile，然后进美团云控制台用`Hue`去做分析。

#### 大量数据load

数据传上去之后，开始发现预热时间非常长，检查后是因为套餐类型选的有些低了，在hive执行任务的时候会产生大量日志文件，不能单纯地只计算源数据消耗的节点和空间。MOS提供了扩容选项,可以根据实际情况动态扩容,扩容时间大概需要几分钟.

初次创建hive表的时候注意数据结构问题导致建表失败,MongoDB的`ObjectId() / ISODate()`对应hive的字段需要好好琢磨一番,一下是建表时候踩的坑:

##### 坑1 保留字

hive在建表的时候把`user`作为保留字段,我们的mongo源数据里刚好有个user字段。如果希望去掉保留字的限制，可以在hive里执行以下命令：

```sql
> set hive.support.sql11.reserved.keywords=false
```

##### 坑2 字段名大小写

hive在声明表的时候，只能用小写名作为字段，如果对应mongo的字段名是大写的话，就应该手工声明映射，反则导入的数据找不到mapping关系内容全都是NULL。

比如mongo字段名`eventKey` ,对应到hive里的`eventkey`,应该像是`_id`的处理办法一样，声明映射。

```
        "id":"_id"
        "eventkey": "eventKey",
```

##### 坑3 时间精度

我们刚好有一个字段是精确到毫秒级的unix时间戳，hive刚刚好不支持这个精度的长度作为时间。HIVE支持：到秒级的int；到纳秒级的floating；”YYYY-MM-DD HH:MM:SS.fffffffff”这种格式的String。我们刚好是毫秒级的Long。如此一来，解决办法是先保精度，存成BIGINT，后面要分析或打印时，可以用UDF来转换。

> Supported conversions:
Integer numeric types: Interpreted as UNIX timestamp in seconds
Floating point numeric types: Interpreted as UNIX timestamp in seconds with decimal precision
Strings: JDBC compliant java.sql.Timestamp format “YYYY-MM-DD HH:MM:SS.fffffffff” (9 decimal place precision)

最终建表时候应该声明成`eventTime BIGINT`,在具体做数据分析的时候这样用这样的办法：

```sql
select
from_unixtime(eventtime/1000)
from eventv4
limit 10
```

#### MongoDB对应hive表结构示例

最终表结构，新建了一个`eventv4`,创建表的方式是`external`,表示drop表后不会删除源数据：

```sql
CREATE external TABLE eventv4
( id STRUCT<oid:STRING, bsontype:INT>,  //特殊声明ObjectId
  eventkey STRING,
  category STRING,
  device STRING,
  uuid STRING,
  role STRING,
  eventtime BIGINT,                     // 毫秒级unixtimestamp
  servertime STRING,
  subject STRING,
  channel STRING,
  os STRING,
  platform STRING,
  location STRING,
  d_os_name STRING,
  netconfig STRING,
  d_appversion STRING,
  u_phone STRING,
  u_publisher STRING,
  u_semester STRING,
  user STRING,
  u_channel STRING,
  u_type STRING,
  u_power STRING,
  u_name STRING,
  u_from STRING,
  u_isbigswitch STRING,
  u_isvip STRING,
  u_level BIGINT,
  u_nickname STRING,
  u_route STRING,
  ability BIGINT
)
ROW FORMAT SERDE
    'com.mongodb.hadoop.hive.BSONSerDe'
WITH SERDEPROPERTIES(
    'mongo.columns.mapping'='{
            "id":"_id",                // _id映射必须声明
            "eventkey": "eventKey",    // 大小写声明
            "eventtime": "eventTime",
            "servertime": "serverTime",
            "netconfig": "netConfig",
            "d_appversion": "d_appVersion",
            "u_isbigswitch": "u_isBigSwitch",
            "u_isvip": "u_isVIP"
    }'
)
STORED AS INPUTFORMAT
    'com.mongodb.hadoop.mapred.BSONFileInputFormat'
OUTPUTFORMAT
    'com.mongodb.hadoop.hive.output.HiveBSONFileOutputFormat'
LOCATION '/eventv4bson/';           // BSON文件在hdfs中的位置
```

#### Hue中查询数据

打开MOS WEB -> 控制台 -> 数据平台 -> 大数据计算，选择目标集群，点击其后的Hue链接进入HUE工作界面，（初次登陆会要求设置用户名、密码），进入Notebooks，鼠标移动至+圈标识，选择SparkSql（可以选择的其它种类很多，比如hive, PySpark, R …），这样就打开了一段snippet，可能要稍等1秒钟，待出现三角执行按扭，即可开始编辑sql语句（语法高亮，自动补全什么的就不多说了），编辑完成，点三角执行按扭，就开始执行了，结果会显示在网页上，可以根据需要绘制图表；另外左侧栏可以显示数据库列表，表列表，字段列表什么的。

也可以命令行方式去做SQL查询,通过mdsrelay登陆至集群，执行命令`beeline -u jdbc:hive2://<your-hostname>:13000 -n anyuser -p anypassword` 即可进行spark-sql交互式命令行界面，在里面执行sql即可。
