---
layout:     post
title:      "Golang开发环境折腾"
subtitle:   "啧.."
date:       2018-07-09
author:     "diggzhang"

---

想跑起来一个go项目，需要首先构建一个顺手的go项目执行环境。记录一下关键配置，以防日后踩坑。

首先是解决命令行内科学上网问题,确保ss可用情况下，在`~/.bashrc`或`~/.zshrc`内添加：

```shell
alias proxy='export all_proxy=socks5://127.0.0.1:1086'
alias unproxy='unset all_proxy'
```

调用方法也非常简单，执行`proxy`即可。

然后就是先装一个初始的系统级的go语言执行环境,下载go的二进制包：

```shell
mkdir ~/go_bin/ && cd ~/go_bin/
export GO_INSTALL_DIR=$(pwd)
wget https://dl.google.com/go/go1.10.2.linux-amd64.tar.gz
tar -xvzf go1.10.2.linux-amd64.tar.gz -C $GO_INSTALL_DIR
```

golang环境变量设置：

```shell
export GOROOT=$GO_INSTALL_DIR/go
export PATH=$PATH:$GO_INSTALL_DIR/go/bin...
```

执行命令`go env`验证是否可行。然后开始安装`gvm`:

```shell
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
# or ...
# zsh < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
```

gvm的详细用法参考[官方文档](https://github.com/moovweb/gvm)。这里重要学习的思路是要为每个golang项目建立不同的go env，设置不同的GOPATH：

```
gvm pkgset create YOUR_OWN_ENV
```

除此之外，还可以考虑使用goland IDE，jetbrain提供了docker管理器，可以借助其功能用docker容器内的golang环境。

