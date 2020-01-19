---
layout:     post
title:      "阿里云归档存储服务"
subtitle:   "超大量数据云端备份"
date:       2016-11-8
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"

tags:
     - 阿里云
     - oas
---

经过几年的数据累计，我们现在已经有TB级的数据。这么大量的数据本身的价值已经超过硬存储的投入价值，考虑到数据安全性，肯定得向着多地备份和云端存储发展。

如果只是考虑数据归档，对拉取数据的时效性没有要求，不涉及分析需求的话，[阿里云的归档存储服务](https://www.aliyun.com/product/oas/?spm=5176.8142029.388261.48.pPknOB)值得考虑。

### 前菜

**重要概念** 使用前需要了解的几个概念：

- Vault：归档目录（档案柜），用于存放归档文件（Archive）；
- Archive：归档文件，即用户上传的数据文件；
- Multipart Upload：针对大文件的分段上传方式；
- Job：用于获取归档文件、文件清单的异步任务；
- Inventory：数据仓库由系统进行定期盘点，这个动作称为 Inventory。

我们用到的两种使用方式：

- `oascmd.py`: 基于 Python SDK 封装，模拟客户端行为，提供简单易用的命令行操作。
- 归档存储 控制台：以 Web 方式提供的可视操作界面，目前支持Vault创建、删除及状态查询。

在一切开始前先开通归档存储服务，[官方文档有详述](https://help.aliyun.com/document_detail/27377.html?spm=5176.doc27376.6.114.aoGyA0)。在归档存储控制台中，可以创建、查看、删除Vault（只能删除空Vault）。

我们选择使用[`oascmd.py`](https://help.aliyun.com/document_detail/27404.html?spm=5176.doc27395.6.141.IxZzNn)作为上传下载工具。直接在`ECS`里使用`pip`最好使用阿里云的镜像。

```shell
$ cat /etc/pip.conf
[global]
trusted-host=mirrors.aliyun.com
index-url=http://mirrors.aliyun.com/pypi/simple

# pip安装方式不同，可能会导致权限错误 [Errno 13] Permission denied，切换到sudo执行即可
$ sudo pip install oassdk

# 安装成后
$ oascmd.py -h
usage: oascmd.py [-h] cmd ...

optional arguments:
  -h, --help       show this help message and exit

Supported actions:
  Commands {ls, cv, rm, upload, createjob, cp, fetch} provide easier ways to
  use OAS by combining commands below them. Generally they will suffice your
  daily use. For advanced operations, use commands ........

```

用户访问OAS服务，需指定所要使用的目标 Region 域名、AccessKeyId和AccessKeySecret

域名地址详见 API 手册 2.1.1 节服务器地址.

公网域名：[ RegionName ].oas.aliyuncs.com
内网域名：[ RegionName ].oas-internal.aliyuncs.com
其中，[ RegionName ]取值为: cn-hangzhou、cn-qingdao、cn-beijing、cn-hongkong等。更多详细说明，请参考《OAS API参考手册》

可以使用OAS_Python_SDK的命令行工具进行快捷配置，详见开发者工具文档中的Python 命令行工具的授权设置：

config [-h] --host host --id id --key key [--port port] [--config-file filename]

### 开工

第一次执行config的时候申请key&id是个坑，官网文档没有说明是否支持`RAM`子账号授权。咨询客服回复是 **未接入**。

```
$ oascmd.py config --host=xxx -i <access_id> -k <access_key>

$ oascmd.py config --host=cn-hangzhou.oas-internal.aliyuncs.com -i <XXX> -k <XXX>
Your configuration is saved to /home/master/.oascredentials.
```

查看已经创建好的Vault:

```shell
$ oascmd.py ls

Marker:
Vault count: 1
VaultID                          VaultName              CreationDate         NumberOfArchives TotalSize    LastInventoryDate
-------------------------------------------------------------------------------------------------------------------------------
9F0FF5ED3F1886EC0EF2DE296BA4E0CC yxxxxxxxxxxxxxxxxxxxs  2016-11-08 16:31:25  0                0.00 B       2016-11-08 16:31:25
0.054(s) elapsed
```

上传文件到指定的Vault，开始执行后可以看到oascmd自动分片了文件上传:

```shell
oascmd.py upload oas://yxxxxxxxxxxxxxxxxxxxs ./yxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx108.7z
File larger than 100MB, multipart upload will be used
Use 228 parts with partsize 32.00 MB to upload
MultiPartUpload ID: 30454CF254D6486FB262DA2FB3B67D37
Uploading part 1...
Upload success
Uploading part 2...
Upload success
Uploading part 3...
Upload success
Uploading part 4...
Upload success
Uploading part 5...
Upload success
Uploading part 6...
Upload success
Uploading part 7...
Upload success
Uploading part 8...

......

Upload success
Archive ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
336.185(s) elapsed
```

尴尬的在后面，已经传完后，暂时看不到ls的结果。ls结果以控制台的最后统计时间为准。归档存储对于数据的统计，是后台异步执行的，所以，除非刚好契合统计任务的执行时间点，刚上传完数据时，Vault信息是不会更新的。Vault信息更新后台任务的执行周期是：每 **1天** 会执行一次。

隔天查看，信息已经刷新。`OAS`，感觉不错。

```shell
$ oascmd.py ls
Marker:
Vault count: 1
VaultID                          VaultName              CreationDate         NumberOfArchives TotalSize    LastInventoryDate
-------------------------------------------------------------------------------------------------------------------------------
9xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxC yxxxxxxxxxxxxxxxxxxxs  2016-11-08 16:31:25  1                7.12 GB      2016-11-09 02:00:02
0.066(s) elapsed
```
