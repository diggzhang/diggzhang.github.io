---
layout:     post
title:      "大数据架构师技能点手册"
subtitle:   "广撒网，多布线"
date:       2019-04-10
author:     "diggzhang"
category: "big data"
tags:
    - big data
---

`Big Data Architect's Handbook`读书地图。

## 大数据基本概念

第1章，为什么选择大数据？，解释了什么是大数据，为什么我们需要大数据，谁应该处理大数据，什么时候使用大数据，以及如何使用大数据。 此处还概述了端到端大数据解决方案的设计考虑，包括云，Hadoop，网络，分析等。

学习点：

1. 概念意义上什么是大数据
2. 对大数据有个概览性认知

|目前掌握程度|学习后新知|
|:--:|:--:|
|参与过大数据体系建设，知道基本的开源方案的选择，对数据科学团队的体系各个职位的工作有一定了解，参与过部分组件的开发|b|

- Technologies: Hadoop, MapReduce, Mahout, Hbase, Cassandra, and so on
- Then, the next level is the infrastructure framework layer that enables the developers to choose from myriad infrastructural offerings depending upon the use case and its solution design
- Analytical Infrastructure: EMC, Netezza, Vertica, Cloudera, Hortonworks
- Operational Infrastructure: Couchbase, Teradata, Informatica and many more
- Infrastructure as a service (IAAS): AWS, Google cloud and many more
- Structured Databases: Oracle, SQLServer, MySQL, Sybase and many more
- The next level specializes in catering to very specific needs in terms of
- Data As A Service (DaaS): Kaggale, Azure, Factual and many more
- Business Intelligence (BI): Qlikview, Cognos, SAP BO and many more
- Analytics and Visualizations: Pentaho, Tableau, Tibco and many more
- Ad–hoc queries over zeta bytes of data take up computation time in the order of hour(s) and are thus typically described as batch. The noteworthy aspect being depicted in the previous figure with respect to the size of the circle is that it is an analogy to capture the size of the data being processed in diagrammatic form.
- Ad impressions/Hashtag trends/deterministic workflows/tweets: These use cases are predominantly termed as online and the compute time is generally in the order of 500ms/1 second. Though the compute time is considerably reduced as compared to previous use cases, the data volume being processed is also significantly reduced. It would be very rapidly arriving data stream of a few GBs in magnitude.
- Financial tracking/mission critical applications: Here, the data volume is low, the data arrival rate is extremely high, the processing is extremely high, and low latency compute results are yielded in time windows of a few milliseconds.

**glossary:**

|keyword|explain|
|:--:|:--:|
|Big Data|Data that is massive in volume, with respect to the processing system, with a variety of structured and unstructured data containing different data patterns to be analyzed.|
|Batch processing|A process of analyzing large datasets, which is typically scheduled and executes in bulk when no other processes are running. This is typically ideal for non-time-sensitive work that operates on very large datasets. Once the process has finished executing the task, it will return results typically as an output file or as a database entry.|
|Cluster computing|Cluster computing is the practice of combining the resources of multiple commodity low-cost hardwares and managing their collective processing and storage capabilities to execute different tasks. It requires a software layer to handle communication between different individual nodes in order to effectively manage and coordinate the execution of assigned work.|
|Data warehouse|A large repository of structured data for analysis and reporting purposes. It is composed of data that is already cleaned, with a definite schema and well integrated with sources. It is normally referred to in the context of traditional systems, such as BI.|
|Data lake|Similar to a data warehouse, for storing large datasets, but it comprises unstructured data. This is a commonly used term in the context of big data solutions that store information such as blogs, posts, videos, photos, and more.|
|Data mining|Data mining is the process of trying to process a mass of data into a more understandable and visual medium. It is a broad term for the practice of trying to find hidden patterns in large datasets.|
|ETL|ETL stands for extract, transform, and load. This mainly refers to traditional systems such as BI, which take raw data and process it for analytical and reporting purposes. It is mainly associated with data warehouses, but characteristics of this process are also found in the ingestion pipelines of big data systems.|
|Hadoop|An open source software platform for processing very large datasets in a distributed environment with respect to storage and computational power, mainly built on low-cost commodity hardware. It is designed for easy scale up from a few to thousands of servers. It will help to process locally stored data in an overall parallel processing setup. It comprises different modules–Hadoop Distributed File System (HDFS), Hadoop MapReduce, and Hadoop YARN (Yet Another Resource Negotiator).|
|In-memory computing|A strategy that involves moving the working datasets entirely within a cluster's collective memory instead of reading it from hard disk, to reduce the processing time while omitting I/O bound operations. Intermediate calculations are not written to disk and are instead held in memory. This is the fundamental idea of projects such as Apache Spark. Because of this, it has huge advantages in speed over I/O bound systems such as MapReduce.|
|Machine learning|The study that involves designing a system that can learn without being explicitly programmed. It can have the ability to adjust and improve itself based on the data fed to it. It involves the implementation of predictive and statistical algorithms that can continually zero in on correct behavior and insights as more data flows through the system.|
|MapReduce|MapReduce is a framework for processing any task in a distributed environment. It works on a Master/Slave principle similar to HDFS. It involves splitting a problem set into different nodes available in a clustered computing environment and produces intermediate results. It then shuffles the results to align like sets, and then reduces them by producing a single value for each set.|
|NoSQL|NoSQL provides a mechanism for storage and retrieval of data that is not in tabular form, such as what we store in relational database systems. It is also called non-SQL or a non-relational database. It is well suited to big data as it is mostly used with unstructured data and can work in distributed environments.|
|Stream processing|The practice of processing individual data items as they move through a system. This will help with real-time analysis of the data as it is being fed to the system. It is useful for time-sensitive operations using high velocity metrics.|



## 大数据环境设置

第2章，大数据环境设置，提供了如何设置环境以运行大数据应用程序的分步指南。

学习点：

1. 大数据学习环境设置
2. 分步操作跟着做

|目前掌握程度|学习后新知|
|:--:|:--:|
|手工跑起来过CDH系统，对Linux系统下得部署有路可循|手动跑起来hadoop前置基础环境，了解ssh在其中的重要作用|

```shell
export JAVA_HOME="/home/master/moduels/jdk1.8.0_144/"
export PATH=$PATH:$JAVA_HOME/bin
export HADOOP_HOME="/home/master/moduels/hadoop-2.8.5/"
export PATH=$PATH:$HADOOP_HOME/bin
export PATH=$PATH:$HADOOP_HOME/sbin
```

## Hadoop生态系统

第3章，Hadoop生态系统，是关于Hadoop生态系统的。 它由不同的开源模块，附件和Apache项目组成，可实现可靠且可扩展的分布式计算。 本章将教您如何使用循序渐进指南构建用于流数据的Hadoop大数据系统。

学习点：

1. 了解Hadoop生态系统
2. 学习构建一次流计算大数据系统

|目前掌握程度|学习后新知|
|:--:|:--:|
|知道基于Hadoop生态家族的主要成员，比如Hive比如Oozie等，流计算框架基于人家写好的Sparkstreaming代码基础上开发过IP地址清理|细致理解dn和nm的关系和调用优先级，在dn的心跳失败或卡顿情况下，发生哪些容错机制|

```
$ hdfs dfs -mkdir /hadooptest
$ hdfs dfs -ls /
$ hdfs dfs -put test.txt /hadooptest/
$ hdfs dfs -get /hadooptest/test.txt hdfsfiles/
$ hdfs dfs -rmdir /hadooptest
```

> We have now developed an understanding of how a program works and is executed in the Hadoop environment, how resources are allocated to a program, and Hadoop's approach to stored data. This information is mostly related to cluster management and custom application processing, but there are many Apache Projects that are related to big data processing that will help to process data. We will now briefly go through some of these projects, as we will be using some of them in our examples and programs later on in this book.

## NoSQL

第4章，NoSQL数据库，解释了流行的NoSQL数据库的概念，原理，属性，性能和混合，以便大数据架构师可以自信地为他们的项目选择合适的NoSQL。 本章将教您如何使用分步指南为杀手级应用程序实现NoSQL。

学习点：

1. 学习了解NoSQL生态和相关概念
2. 知道各种NoSQL何时去用

|目前掌握程度|学习后新知|
|:--:|:--:|
|比较熟悉MongoDB的运维和数据分析，基于Redis做过IP地理信息转换|b|

## 业界集成大数据解决方案

第5章, 介绍流行的商业集成（off-the-shelf tools）大数据工具，并提供了实用的Stream Analytics示例。

学习点：

1. 了解业界集成工具

|目前掌握程度|学习后新知|
|:--:|:--:|
|生产环境主要对阿里云的日志服务有个大概了解|b|

## 容器化

第6章，容器化，介绍了基于容器的虚拟化的概念和应用。 它是一种操作系统级虚拟化方法，用于部署和运行分布式应用程序，而无需为每个应用程序启动整个VM。 此外，这里展示了使用Openshift管理Dockers和Kubernetes。

学习点：

1. 了解容器化的概念和相关应用
2. Docker/k8s

|目前掌握程度|学习后新知|
|:--:|:--:|
|非常习惯使用Docker-compose编排自己的项目|b|

## 网络架构

第7章“网络基础结构”教授架构师在机架，数据中心和地理位置设计大数据系统的基本网络技术。 此外，本章将通过分步指南向您介绍网络可视化工具。

学习点：

1. 了解机架上的知识
2. 学习如何做到网络可视化

|目前掌握程度|学习后新知|
|:--:|:--:|
|对IOS不陌生，下过机房，做过百人VLAN规划|b|

## 云基础架构

第8章，云基础架构，从性能和功能的角度介绍了大数据云基础架构设计的基本考虑因素。 在云中部署大数据的要求与传统应用程序截然不同。 因此，大数据架构师必须仔细设计，特别是通过使用云中的大数据功能来估算要分析的数据量，因为并非所有公共或私有云产品都是为了容纳大数据解决方案而构建的。

学习点：

1. 了解云基础架构的构建模式
2. 学会如何构建大数据云服务
3. 学会如何衡量云上大数据的解决方案

|目前掌握程度|学习后新知|
|:--:|:--:|
|了解现代高并发架构的样子，但是对于云上大数据，除了阿里云提供的生态外，别无了解|b|

## 安全和监控

第9章, “安全和监控”是关于安全性的基本知识，包括下一代防火墙，DevOps安全性和监控工具。

学习点：

1. 如何做安全和监控
2. 了解下一代安全管理方案、DevOps安全性、监控工具

|目前掌握程度|学习后新知|
|:--:|:--:|
|参与并完善了整个大数据系统的数据流调度和监控，主要使用的是Airflow|b|

## 前端架构

第10章，前端架构，介绍了前端架构，它是一组工具和流程，旨在提高前端代码的质量，同时为大数据系统创建更高r，可扩展和可持续的设计。要成为一名成功的大数据架构师，一个关键因素是向大多数非技术人员（如C级管理人员）和具有用户友好，优雅且响应迅速的用户图形界面的决策者提供有说服力的分析结果。 本章将教您如何使用React + Redux框架构建响应迅速的调试用户界面。

学习点：

1. 了解现代前端架构的模式
2. React/Redux

|目前掌握程度|学习后新知|
|:--:|:--:|
|使用基于vue的d2admin做过实际系统开发，学过react，前端工具链不陌生|b|

## 后端架构

第11章，后端架构，展示了如何使用不同的技术组合设计可扩展，灵活，可管理且经济高效的分布式后端架构。 它使用RESTful Web API服务处理业务逻辑和数据存储。

学习点：

1. 后端架构模式
2. Restful Web API

|目前掌握程度|学习后新知|
|:--:|:--:|
|了解restful网络服务基本构建模式，使用node express/koa和python flask有过生产环境的实现|b|

## 机器学习

第12章，机器学习，讲授机器学习的基本概念和杀手级应用。 您将了解最有效的机器学习技术，并获得实施它们并让它们为您自己和您的企业工作的实践。 您不仅可以了解学习的理论基础，还可以了解快速有效地将这些技术应用于新问题所需的实用技术。

学习点：

1. 机器学习基本概念
2. 了解落地应用

|目前掌握程度|学习后新知|
|:--:|:--:|
|只听其名和基本思想，用过python的数据处理包，比如pandas。不了解具体|b|


## 人工智能

第13章，关于人工智能应用，介绍AI和CNN在大数据领域杀手级应用。CNN或深度学习应用于机器学习领域，是处理非结构化大数据的一种好方法。

学习点：

1. 人工智能相关
2. CNN

|目前掌握程度|学习后新知|
|:--:|:--:|
|只听其名，不知其形|b|

## Elasticsearch

第14章，Elasticsearch，展示了如何使用开源工具Elasticsearch在大数据系统中执行搜索任务。 这是因为它是一个企业级搜索引擎，易于扩展。 它的更多功能包括：方便的REST API和JSON响应，良好的文档，Sense UI，稳定且经过验证的Lucene底层引擎，出色的查询DSL，多租户，高级搜索功能，可配置和可扩展，渗透，自定义分析器，On-the-Fly Analyzer选择，丰富的生态系统和活跃的社区。

学习点：

1. Es技术栈

|目前掌握程度|学习后新知|
|:--:|:--:|
|手工跑过elk技术栈，不了解具体|b|

## 结构化数据

第15章，结构化数据，介绍了使用开源工具来操作和分析结构化数据。

学习点：

1. 处理结构化数据的相关工具组
2. hbase/sqoop

|目前掌握程度|学习后新知|
|:--:|:--:|
|做过sqoop导入数据的处理|b|

## 非结构化数据

第16章，非结构化数据，演示了如何使用开源工具来操作和分析非结构化数据。 读者将学习如何使用机器学习和AI来提取信息，以便在诸如零售推荐系统和面部识别等杀手级应用中进行分析。

学习点：

1. 了解非结构化数据的处理技术
2. 非结构数据的分析

|目前掌握程度|学习后新知|
|:--:|:--:|
|无操作经验|b|

## 数据可视化

第17章，数据可视化，说明了如何使用工具使用两个顶级工具Matplotlib和D3.js向用户呈现分析结果。

学习点：

1. 数据可视化技术
2. Matplotlib
3. D3.js

|目前掌握程度|学习后新知|
|:--:|:--:|
|使用过g2和echarts，学习过一点点d3.js，了解基本使用方法|b|

## 大数据系统

第18章，金融交易系统，涵盖算法交易的利益和策略，以及如何通过分步指南设计和部署端到端金融交易系统。

第19章，零售推荐系统介绍了如何通过分步指南设计和部署端到端零售推荐系统。

|目前掌握程度|学习后新知|
|:--:|:--:|
|只参与过公司场景下得大数据系统建设辅助|b|