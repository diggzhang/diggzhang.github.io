---
layout:     post
title:      "诊断并解决MongoDB BTC勒索攻击：一个实战案例"
subtitle:   ""
date:       2023-09-14
author:     "diggzhang"
tags:
    - MongoDB
    - Hack

---


## 引言

最近，我的朋友遭遇了一个令人不安的安全问题：他的MongoDB数据库受到了BTC勒索攻击。经历了一系列排查和解决的步骤后，我决定把这个经验总结成这篇博客。文中介绍用于诊断和解决问题的工具和方法，并分享一些有用的经验教训。


## 开始时的状况

问题开始于我的朋友发现数据库中有一些未知的集合，这些集合包含了勒索信息。一个严重的安全问题，需要立即采取行动。


```
{ "_id" : ObjectId("64fe8b50a20497578c3d0826"), "content" : "All your data is backed up. You must pay 0.0125 BTC to 19GCf7HvckzroTEQQcAfotci9WDkzpk5jW In 48 hours, your data will be publicly disclosed and deleted. (more information: go to http://iplis.ru/data1)After paying send mail to us: rambler+FUCKYOU@onionmail.org and we will provide a link for you to download your data. Your DBCODE is: FUCKYOU" }
```

绝不妥协，绝不纵容勒索。

## 使用Mongo Shell进行初步审查

首先使用Mongo Shell连接到数据库以进行初步审查。虽然这个工具提供了许多有用的命令来查看数据库和集合的状态，但它无法告诉他哪个用户从哪个IP地址进行了操作。

MongoDB企业版才具备审计功能。但是对于大部分MongoDB用户来说，大家都是社区版使用者。


翻阅日志，只能看到建表信息：

```
cat /var/log/mongodb/mongod.log | grep README
```


## 配置MongoDB日志?

初步商量的想法，肯定是先增加日志级别协助排查。

调整MongoDB的日志设置，以便记录更多详细的审计信息。修改 `/etc/mongod.conf` 文件，并在其中添加了如下内容：

```
systemLog:
  destination: file
  path: "/var/log/mongodb/mongod.log"
  logAppend: true
  component:
    accessControl:
      verbosity: 2
```     
      
理论上来说，这样的配置可以帮助他了解数据库的访问控制信息，但担心仍然没有足够的数据来诊断问题。同时考虑到，我们第一次遭遇这样的情况，不确定直接重启MongoDB实例，将会遭遇怎样的后果。


直接通过日志来看，名为 `REAMDE` 的collection内容在不定期重复创建。**我们决定：直接抓鬼。**

## 利用tcpdump和Wireshark捕获网络流量

考虑到MongoDB日志的局限性，决定使用 tcpdump 工具捕获与数据库相关的网络流量。运行 tcpdump 后，得到了一个包含所有网络数据包的 pcap 文件。

```
sudo yum install tcpdump
```

只监听`27017`端口，用tcpdump录制流量，产生的`mongodb_packets.pcap`将会解答一切疑惑。

```
sudo tcpdump -i eth0 'port 27017' -w mongodb_packets.pcap
```


## Wireshark分析

功夫不负有心人，一夜等待后，通过MongoDB日志发现再次发生了创建勒索表的行为。

```
2023-09-14T06:22:36.094+0800 I STORAGE  [conn14539449] createCollection: READ__ME_TO_RECOVER_YOUR_DATA.README with generated UUID: fc718e02-1707-4b94-9881-3e4d274a9fe1
```

Wireshark打开这个 pcap 文件，并开始仔细分析数据包。最初尝试了多种过滤方法，优先按照日志触发时间筛选了**心目中的可疑IP**：

```
(tcp and ip.addr == XXX.1.1XX.X0) and (frame.time >= "Sep 14, 2023 03:00:00")

```


但最终使用了一个非常简单但非常有效的显示过滤器：

```
frame contains "README" or frame contains "create"
```

这个过滤器立即突显出了一些非常可疑的数据包，其中包括勒索软件很可能用于创建恶意集合的命令。

我们发现：竟然是一个外网IP，访问到了处于内网环境中的MongoDB。


## 破案


我们当即陷入各种揣测和幻想，这尼玛骇客都玩得这么牛逼了？怎么渗透进来的？

同志们，这如果是按照一个技术问题排查，那以我们的技术能力来看，这简直算是与顶尖骇客较量了，一台内网的机器，你这是怎么黑进来的？？？

但是真相往往需要一点点灵感和跳出局限。为什么我们有个**心目中的可疑IP**呢？因为数据库被黑时间段，是另一个BI项目上线时间段，我们怀疑过某种关联。

而这个关联虽然没有通过“技术上”通过流量访问判断出来，但是有逻辑意义上的关联。继续深挖发现，为了BI项目，可能各个项目组之间缺乏沟通和安全意识，是有在公网上打开了27017端口！

使用nmap甚至能够探测到版本号！

```
sudo nmap -p 27017 -sV XXX.16.22.XXX

PORT      STATE SERVICE VERSION
27017/tcp open  mongodb MongoDB 4.0.24

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.38 seconds
```

好了，后面就是联系负责的小伙伴去关端口了。

得亏数据库内容是测试库，不重要。

## 结论和教训

1. 多元化工具：在安全分析中，没有哪一个工具能解决所有问题。Mongo Shell、MongoDB日志、tcpdump和Wireshark都有各自的优势和局限。
2. 深入分析：单单依赖数据库日志是不够的。网络流量分析提供了更多线索，可以用来诊断和解决问题。要结合场景看问题，不要纯粹寻求技术解读。
3. 关键词过滤：有时候，简单的关键词搜索就足以找出问题的根源。在这个案例中，一个简单的Wireshark过滤器就帮助他找到了问题的核心。
4. 安全最佳实践：这次经历提醒了诸位，加强访问控制和进行定期的安全审查是非常必要的。

通过综合运用这些工具和方法，成功地找出了问题的源头，并避免了可能更严重的损失。我希望我的这篇博客能为面临类似问题的人提供一些实用的指导。再次强调，数据库安全是一个永不停歇的战斗，但有了正确的工具和方法，我们至少能更有信心地面对挑战。