---
layout:     post
title:      "使用Python借力腾讯邮箱发送邮件"
subtitle:   "狗日的腾..."
date:       2017-01-04
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - python
     - 运维
---

## 需求背景

我们有两台MySQL服务器需要在应用挂了的时候发送报警邮件。但是当我试着用从`163邮箱`群发`QQ邮箱`时，发现邮件被各种问题`BANG`掉了。而且只在群发的时候报错，单独发不会报错。

发送了几次报错都是验证错误，于是尝试使用腾讯邮箱作为发信服务。

## 基础配置

发邮件代码中会用到腾讯邮箱的账户和密码，腾讯邮箱将密码替换为`授权码`以保证信息安全。

官方文档中有详细说明如何[获取授权码](http://service.mail.qq.com/cgi-bin/help?subtype=1&&no=1001256&&id=28)

## CODE

```python
# filename: send_mail.py
# -*- coding: utf-8 -*-
# !/usr/bin/env python


import os
import sys
import smtplib
from email.mime.text import MIMEText


# mail configure
mail_to_list = ["1111111111@qq.com", "222222222@qq.com", "333333333@qq.com"]
mail_host = "smtp.qq.com"
mail_user = "1111111111@qq.com"
mail_pass = "yyxxxxxxxxxxxxxx"  # guanghedev
mail_postfix = "qq.com"
mail_host_port = 465


def fetch_ip_address():
    try:
        ip = os.popen("ifconfig | grep 10.8.8.").read().lstrip().split(" ")[1]
    except Exception as e:
        ip = ""
    return ip


def send_mail_core(mail_to_list, mail_title, mail_content):
    me = "GuangheAutoRobot" + "<" + mail_user + "@" + mail_postfix + ">"
    msg = MIMEText(mail_content,_subtype='html',_charset='utf-8')

    msg["Subject"] = mail_title
    msg["From"] = me
    msg["To"] = ";".join(mail_to_list)
    try:
        s = smtplib.SMTP_SSL()
        s.connect(mail_host+':'+str(mail_host_port))
        s.login(mail_user, mail_pass)
        s.sendmail(me, mail_to_list, msg.as_string())
        s.close()
        return True
    except Exception as e:
        print(str(e))
        return False

"""
Useage:
    1. send mail with title:
        `$ python send_mail.py "mysql crash"`
    2. send mail with title and content:
        `$ python send_mail.py "mysql crash" "something"`
"""
if __name__ == "__main__":
    try:
        ip = fetch_ip_address()
        if len(sys.argv) == 3:
            mail_title = ip + " " + sys.argv[1]
            mail_content = sys.argv[2]
        else:
            mail_title = ip + " " + sys.argv[1]
            mail_content = "May the force be with you!"

        if send_mail_core(mail_to_list, mail_title, mail_content):
            print("[*] Send mail success: %s") % (mail_title)
            sys.exit()
        else:
            print("[*] Send mail failed: %s") % (mail_title)
    except Exception as e:
        print(str(e))
        raise
```

跑起来：

```shell
$ python send_mail.py "MySQL Crash"
```
