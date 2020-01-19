---
layout:     post
title:      "telnet访问未名BBS乱码"
subtitle:   "来自远古的神秘力量"
date:       2017-03-23
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - funny
     - bbs
     - pku
---

终于注册到了校园网络账号，可以去传说的`未名BBS`走一遭。最经典的是可以`telnet`访问，体验到来自远古的神秘力量。

```shell
$ telnet bbs.pku.edu.cn
```

结果发现登录后一票乱码，ヾ(｡｀Д´｡)我擦

查了一下是编码问题，需要设置一下`iterm2`，新建一个Profiles

```
[打开iterm2 && command + , ] 调出配置界面
[去Profiles Tab]
[选项卡Terminel]
[设置Character Encoding为 Chinese(GBK)]
```

然后爽了,各种`ASCII`艺术

```shell
$ telnet bbs.pku.edu.cn



                    ^_*__*__*__*__*__*__*__*__*__*__*__*_^
                   /   '  '   '   '   '`   `   `   `  `   \
                  /    /        北  京  大  学        \    \
               . '  /   /   /   BBS.PKU.EDU.CN   \   \   \  `  .
            U U U U U U U /U U U\||/U UU U\||/U U U\ U U U U U U U
               |" " " "| |..---..||/| 欢 |\||..---..| |" " " "|
 ==============| " " " | |..---..|| |    | ||..---..| | " " " |==============
               |" " " "| |..---..||/| 迎 |\||..---..| |" " " "|
               | " " " | |..---..|| |    | ||..---..| | " " " |
     Y Y Y Y Y |" " " "| |..---..||/  您  \||..---..| |" " " "| Y Y Y Y Y
                        /       /  ________  \       \
                 /   /   /  /  / ____________ \  \  \   \   \
                              /________________\


欢迎光临【 北大未名站 】 [ Enter '.' to login for UTF-8 ]
可注册帐号数: [120000] 目前帐号数: [45478] 目前在线: [4241] 匿名: [2664]
从 [2004年 1月31日] 起, 最高人数记录: [4597/9194] 累计访问人次: [331919482]
请输入帐号(试用请输入 `guest'):

```
