---
layout:     post
title:      "Linux下用p7zip/7za解压包内指定文件"
subtitle:   "狗着"
date:       2018-03-01
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - linux
---

背景是我将一个月的文件都按天分割，统一打包成`7z`包。结果突然想提出来某一天的数据。

说白就是，7za p7zip单独解压压缩包内的指定文件，每次用到都要搜一下，死活记不住，写这里备忘。

关键命令就是下面两条：

1. 列出文件内容: `7za l archive.7z`
2. 解压指定文件: `7za e archive.7z spec_file`

如果已经存在一个7z包，希望往里面加内容：

```shell
7za a archive.7z add_spec_file
```
