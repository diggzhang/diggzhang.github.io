---
layout:     post
title:      "Apache-airflow 钉钉机器人插件"
subtitle:   "不看邮件就钉死你系列"
date:       2018-04-12
author:     "diggzhang"
category: "airflow"
tags:
    - airflow
---

## 背景

`Airflow`默认提供邮件和`Slack`插件发送报警邮件的功能。但是日常我们希望通过钉钉机器人形式发送。

前期开发过程中使用的环境是`python 3.4`，airflow的一些插件库滞后更新到python3，所以推荐用`python 2.7`。

**测试的airflow版本是`apache-airflow (1.9.0)`。**

## 获取钉钉机器人

在钉钉群内右上角可以看到`Group Robot`， 依照引导创建一个`Webhook`机器人，会获得一个webhook地址。

[钉钉机器人官方文档](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.karFPe&treeId=257&articleId=105735&docType=1)

这里构建一个简单的钉钉机器人python示例：

```python
# filename: dingbot.py
import requests #requests (2.18.4)
import json
import urllib3 # urllib3 (1.22)

# ref: http://urllib3.readthedocs.io/en/latest/advanced-usage.html#ssl-warnings
urllib3.disable_warnings()

# dingbot webhook uri
bot_url = 'https://oapi.dingtalk.com/robot/send?access_token=2333333333333333333333333333333333333333333333333333333333333333'

warning_text = {
    "title": "airflow",
    "text": "airflow error"
}

def dingding_bot(bot_url, data):
    headers = {'Content-Type': 'application/json'}
    post_data = {
        "msgtype": "markdown",
        "markdown": data
    }
    r = requests.post(bot_url, headers=headers,data=json.dumps(post_data))

dingding_bot(bot_url, warning_text)
```

```shell
python dingbot.py
# 钉钉群组内会收到`warning_text`内的消息
```

接下来要做的就是，仿照airflow发邮件的原理，把钉钉机器人引入到airflow当中。

## Airflow邮件配置

`Airflow`邮件配置主要依赖`airflow.cfg`当中`[email] / [smtp]`配置信息，如果在`python3`环境下测试发信，会遇到两种错误：

1. `ImportError: No module named 'StringIO'` 这是因为python版本导致，参考[stringio-in-python3](https://stackoverflow.com/questions/11914472/stringio-in-python3)
2. `socket.gaierror` 在`s = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) if SMTP_SSL else smtplib.SMTP(SMTP_HOST, SMTP_PORT)`行[抛出错误](https://gist.github.com/diggzhang/a106e89ae78fea77fbc5532384a2f324)，`smtplib`底层依赖问题，切换到`python 2.7`环境解决。

**总之，airflow生产环境一定要用python2.7。**(立这个flag的时间是2018年4月)

尝试使用网易邮箱测试了`airflow`默认的邮件模块：

```
[email]
email_backend = airflow.utils.email.send_email_smtp


[smtp]
# If you want airflow to send emails on retries, failure, and you want to use
# the airflow.utils.email.send_email_smtp function, you have to configure an
# smtp server herei
smtp_host = smtp.126.com
smtp_starttls = True
smtp_ssl = False
# Uncomment and set the user/pass settings if you want to use SMTP AUTH
smtp_user = g*********o
smtp_password = h*******
smtp_port = 25
smtp_mail_from = g*********o@126.com
```

在`DAG`中，需要声明三个参数`email_on_failure: Ture`，`'email_on_retry': True`，然后`email`指定接收报警邮件的邮箱:

```python
default_args = {
    'owner': 'diggzhang',
    'depends_on_past': False,
    'start_date': airflow.utils.dates.days_ago(2),
    'email': '1********4@qq.com',
    'email_on_failure': True,
    'email_on_retry': True,
    'retries': 0,
}
```

测试执行dag，应该会顺利收到邮件。

整个过程中，需要注意的是，在配置文件中，指明的`[email]`项是邮件插件，`[smtp]`是smtp相关配置。我们在自己的`DAG`中配置了邮件发送时机和接收邮箱。
当触发dag后，任务task执行重试或者失败的时候，会通过`airflow.utils.email.send_email_smtp`模块依据dag配置发送报警。

打开`<yours_airflow_install_path>/airflow/utils/email.py`分析，里面主要包含几个模块：

```python
send_email()
send_email_smtp()
send_MIME_email()
get_email_address_list()
```

其中的`send_email()`最有意思，粗略读源码可以得知是从`airflow.cfg`配置中读取邮件模块，通过`importlib`注册到了上下文中，其余几个函数都是围绕着怎么发邮件：

```python
def send_email(to, subject, html_content, files=None, dryrun=False, cc=None, bcc=None, mime_subtype='mixed'):
    """
    Send email using backend specified in EMAIL_BACKEND.
    """
    path, attr = configuration.get('email', 'EMAIL_BACKEND').rsplit('.', 1)
    module = importlib.import_module(path)
    backend = getattr(module, attr)
    return backend(to, subject, html_content, files=files, dryrun=dryrun, cc=cc, bcc=bcc, mime_subtype=mime_subtype)
```

hmmmmmm...大概已经知道要怎么抄了...233333，稍后就是照抄一个`email.py`叫`dingbot.py`，模仿这里。

那么到底是哪部分调用了`send_email()`，只要找出调用该函数的地方，应该就是task触发邮件通知的地方。
于是顺藤摸模块找到了`<yours_airflow_install_path>/airflow/models.py`，主要关心里面的`BaseOperator(LoggingMixin)`，呵，这不就是万物的根基吗。从这里已经能一一对应的看到dag中的各个配置参数了:

```python
# BaseOperator.__init__
def __init__(
         self,
         task_id,
         owner=configuration.get('operators', 'DEFAULT_OWNER'),
         email=None,
         email_on_retry=True,
         email_on_failure=True,
         .......
)
```

稍后就是增补钉钉机器人相关属性到这里，在`models.py`中可以看到引入了`from airflow.utils.email import send_email`，在`TaskInstance类`中用`email_alert方法`捕获task实例的信息填充成邮件消息体。

而在`TaskInstance类`中的`handle_failure()`方法，当判断到任务重试或失败状态时候，调用`email_alert`发信。

至此，`airflow`发邮件的整个关系链清晰很多。开始抄改，引入钉钉机器人。

## Airflow + 钉钉机器人

先写`airflow.cfg`的配置:

```
[email]
email_backend = airflow.utils.email.send_email_smtp

[smtp]
# .....

[dingbot]
ding_bot_backend = airflow.utils.dingbot.dingbot_msg_sender

[dingding]
bot_url = https://oapi.dingtalk.com/robot/send?access_token=2333
```

`[dingbot]`声明用到的机器人发信模块，`[dingding]`声明钉钉机器人的webhook。

呼应配置文件创建`<yours_airflow_install_path>/airflow/utils/dingbot.py`，并写明`dingbot_msg_sender`方法：

```shell
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals
from builtins import str
from past.builtins import basestring
import importlib
import os
from airflow import configuration
from airflow.exceptions import AirflowConfigException
from airflow.utils.log.logging_mixin import LoggingMixin

import requests
import json
import urllib3
urllib3.disable_warnings()

def dingbot_msg_sender(msg):
    bot_url = configuration.get('dingding', 'BOT_URL')
    headers = {'Content-Type': 'application/json'}

    md_text = {
        "title": "AIRFLOW ERROR",
        "text": msg
    }

    post_data = {
        "msgtype": "markdown",
        "markdown": md_text
    }

    r = requests.post(bot_url, headers=headers,data=json.dumps(post_data))


def ding_bot_backend(msg):
    """
    Send ding message using backend specified in DING_BOT_BACKEND
    :param msg:
    :return:
    """
    path, attr = configuration.get('dingbot', 'DING_BOT_BACKEND').rsplit('.', 1)
    module = importlib.import_module(path)
    backend = getattr(module, attr)
    return backend(msg)

```

一切都和`email.py`套路一致。发信组件代码完成后，就进入`models.py`开始做调整。主要修改的地方是：

1. `BaseOperator.__init__()` 里面增加钉钉机器人的初始化配置参数
2. `TaskInstance.handle_failure()` 内增加发信判断
3. 仿照 `TaskInstance.email_alert()` 写一个 `TaskInstance.dingbot_alert()` 

依序逐步开始hack：

首先是`BaseOperator`的修改，默认`__init__()`方法内，仿照email的内容创建两个初始化时候的参数`ding_on_retry/ding_on_failure`:

```python
    def __init__(
            self,
            email=None,
            email_on_retry=True,
            email_on_failure=True,
            ding_on_retry=True,
            ding_on_failure=True,
            retry_delay=timedelta(seconds=300),
            ......
    )

    self.email_on_retry = email_on_retry
    self.email_on_failure = email_on_failure
    self.ding_on_retry = ding_on_retry
    self.ding_on_failure = ding_on_failure
    ......
```

这部分就对应到了dag任务配置中的DAG的`default_args`配置：

```python
default_args = {
    'owner': 'diggzhang',
    'depends_on_past': False,
    'start_date': airflow.utils.dates.days_ago(2),
    'email': '1*********@qq.com',
    'email_on_failure': True,
    'email_on_retry': True,
    'ding_on_failure': True,
    'ding_on_retry': True,
    'retries': 0,
}

dag = DAG(
    'daily_reporter_airflow_2',
    default_args=default_args,
    description='offline daily report scripts',
    schedule_interval=timedelta(days=1))
```

第二步是在 `TaskInstance.handle_failure()` 中判断任务失败的地方，和邮件一样，补一个if判断：

```python
class TaskInstance(Base, LoggingMixin):
    ......

    def handle_failure(self, error, test_mode=False, context=None):
        try:
            if task.retries and self.try_number <= self.max_tries:
                self.state = State.UP_FOR_RETRY
                self.log.info('Marking task as UP_FOR_RETRY')
                if task.email_on_retry and task.email:
                    self.email_alert(error, is_retry=True)
                if task.ding_on_retry:
                    self.dingbot_alert(error, is_retry=True)
            else:
                self.state = State.FAILED
                if task.retries:
                    self.log.info('All retries failed; marking task as FAILED')
                else:
                    self.log.info('Marking task as FAILED.')
                if task.email_on_failure and task.email:
                    self.email_alert(error, is_retry=False)
                if task.ding_on_failure:
                    self.dingbot_alert(error, is_retry=True)
        except Exception as e2:
            self.log.error('Failed to send email to: %s', task.email)
            self.log.exception(e2)

    .....,
```

最后就是在`models.py`中引入最先写好的钉钉发信模块：

```python
from airflow.utils.email import send_email
from airflow.utils.dingbot import dingbot_msg_sender

......

class TaskInstance(Base, LoggingMixin):
    ......
    def email_alert(self, exception, is_retry=False):
        .......

    def dingbot_alert(self, exception, is_retry=False):
        task = self.task
        title = "Airflow alert: {self}".format(**locals())
        exception = str(exception).replace('\n', '<br>')
        body = (
            "<h2> {self.task_id} </h2> <br>"
            "Try {try_number} out of {max_tries}<br>"
            "Exception:<br>{exception}<br>"
            "Log: <a href='{self.log_url}'>Link</a><br>"
        ).format(try_number=self.try_number, max_tries=self.max_tries + 1, **locals())
        dingbot_msg_sender(body)
```

至此大功告成。