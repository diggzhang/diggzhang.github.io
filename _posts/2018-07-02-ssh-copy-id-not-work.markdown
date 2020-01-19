---
layout:     post
title:      "ssh-copy-id免密码登录失败问题"
subtitle:   "寻找问题的边界"
date:       2018-07-02
author:     "diggzhang"

---


一般我们如果希望做到两台服务器之间的免密码登录会习惯使用`ssh-copy-id`，[参考](https://www.ssh.com/ssh/copy-id):


```shell
ssh-copy-id -i ~/.ssh/mykey user@host
```

交互pubkey后一般就可以直接ssh到远端机器，但是我遇到的问题是，交换key后，一直没有问题。最近突然，ssh会问询密码。

在目标机上面，看日志发现：

```shell
> sudo tail -f /var/log/secure
Authentication refused: bad ownership or modes for directory /home/<YOUR_ID>/.ssh
```

导致这个问题的原因是`~/.ssh`目录权限问题导致，ssh账户不能有`home`目录和`~/.ssh`都有相关组的写权限。家目录写权限只限于你的账户，`~/.ssh`权限需要是`700`，相应里面的`authorized_keys`权限需要是`600`。

将目录权限重新设置成ssh规定的权限等级即可：

```
> chmod g-w /home/<YOUR_ID>
> chmod 700 /home/<YOUR_ID>/.ssh
> chmod 600 /home/<YOUR_ID>/.ssh/authorized_keys
```

额...为什么权限目录会突然变了呢，调查后发现是运维人员不小心更动了目录权限...

所以如果想完全避免这种问题，可以考虑在行内指定ssh密码，依赖工具`sshpass`：

```
sshpass -p 'YourPassword' ssh user@host
```
