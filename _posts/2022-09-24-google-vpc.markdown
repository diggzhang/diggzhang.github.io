---
layout:     post
title:      "搭建Google VPC网络下的集群"
subtitle:   "高，实在是高"
date:       2022-09-24
author:     "diggzhang"
tags:
    - Google Cloud
    - GCP
    - Nginx
---

最近一周，我接到一个有趣的任务——在Google Cloud下搭建一个应用服务。主体结构如下：

<img src={{site.baseurl}}"/img/in-post/google-vpc/vpcdemo.drawio.png" alt="batchjob">

这是一个典型的网关做代理的架构。在这种架构中：

1. VPC网络内，节点之间可以互访
2. 真正提供http应用服务的是藏到代理节点后面的机器
3. 只有Proxy节点有公网IP，所以用户无法直接访问到VPC内的节点
4. Proxy节点内架设Nginx，通过IP或域名区分，将流量转发到下游机器，所以一般也称之为代理网关或跳板机
5. VPC内所有节点需要可以访问到公网，用于Yum或者其它需要网络的服务交互

GCP平台与其它云平台最不一样的是，所有服务可以基于`gcloud cli`命令行工具完成。
任务开始！

# 创建VPC

# 创建跳板机

```
gcloud beta compute instances create magicbean-backdoor-image-1 --project=fluent-alliance-358018 --zone=us-central1-a --machine-type=e2-medium --network-interface=network-tier=PREMIUM,subnet=magicbean-backdoor-vpc --can-ip-forward --maintenance-policy=MIGRATE --provisioning-model=STANDARD --service-account=161693588830-compute@developer.gserviceaccount.com --scopes=https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append --min-cpu-platform=Automatic --tags=magicbean-backdoor-vpc,http-server,https-server --no-shielded-secure-boot --shielded-vtpm --shielded-integrity-monitoring --reservation-affinity=any --source-machine-image=magicbean-backdoor-image
```

# 创建VPC内其它节点

# 创建Cloud NAT

# 配置Nginx

# 配置https

