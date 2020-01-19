---
layout:     post
title:      "airflow安装与SSHOperator"
subtitle:   ""
date:       2018-04-02
author:     "diggzhang"
category: "airflow"
tags:
    - airflow
---

需求背景是我希望可以通过airflow作为调度工具远程ssh到某台机器上面执行一系列脚本。

## Installtion

安装airflow可以直接通过pip安装，但是不确定官方推荐安装版本，通过`pypi`源搜索源推断是2.7、3.4版本。

[apache-airflow pypi ](https://pypi.python.org/pypi/apache-airflow/1.9.0)

环境初始化：

```shell
pyenv install 3.4.0
pyenv virtualenv 3.4.0 apache-airflow-env-py34
cd ~/airflow
pyenv local apache-airflow-env-py34
```

在安装`airflow`之前升级一下`setuptools`,否则在后续依赖安装过程中会因为`setuptools`版本过低而中断：

```shell
pip install -U setuptools
pip install "apache-airflow"
```

airflow使用`paramiko`实现了ssh协议，使用`cryptography`实现底层加密，这里会遇到一些坑，解决思路就是缺啥补啥：

```shell
pip install cffi #https://github.com/pyca/cryptography/issues/1981
pip install paramiko
```

其实在包安装后已经可以开启`airflow webserver`，从顶部导航依次点击`Admin->Connection`，就会进入各种链接公共变量定义的地方，此时会提示安装`cryptography`：

```
Warning: Connection passwords are stored in plaintext until you install the Python "cryptography" library. You can find installation instructions here: https://cryptography.io/en/latest/installation/. Once installed, instructions for creating an encryption key will be displayed the next time you import Airflow.
```

在`pip install cryptography`安装过程中，会因`openssl`库支持问题中断编译：


```shell
build/temp.macosx-10.12-x86_64-3.4/_openssl.c:493:10: fatal error: 'openssl/opensslv.h' file not found

#include <openssl/opensslv.h>

         ^~~~~~~~~~~~~~~~~~~~

         1 error generated.

```

解决办法：

```shell
brew upgrade openssl
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

参考链接：

- https://github.com/pyca/cryptography/issues/3489
- https://cryptography.io/en/latest/installation/#building-cryptography-on-macos
- https://github.com/pyca/cryptography/issues/3367

安装好后的测试流程：

1. 编写DAG放到`${AIRFLOW_HOME}/dags`
2. `airflow test` 测试dag任务是否可以成功执行
3. `airflow webserver` 开启前端监控页
4. `airflow scheduler` 执行dag调度
5. 默认在`localhost:8080`web页面下看执行情况

## SSHOperator

airflow目前搜到的资料和官方文档，api滞后更新了。比如`SSHOperator`，只能靠着源码边猜边用。

首先启动`airflow webserver -p 8080`，在`Admin->Connection`下，找到`Conn Id`是`ssh_default`的记录。编辑填入`host主机地址/login用户名/password密码`，供后面的dag内task用。

Airflow SSHOperator使用示例如下：

```python
from airflow.contrib.operators.ssh_operator import SSHOperator

t4 = SSHOperator(
    ssh_conn_id='ssh_default', # 指定conn_id
    task_id='ssh_to_other_host',
    command='touch /tmp/test_ssh_in_airflow.txt', # 在remote机器/tmp/下面创建一个文件
    dag=dag
)
```

完整示例源码在[这里](https://github.com/diggzhang/python_snip/blob/master/airflow/airflow_ssh.py)。

测试：

```shell
$ airflow test shell_ssh_test ssh_to_other_host 2018-04-02
```

后续还有个小问题，如果希望在remote机器上面执行脚本，需要留意在`.sh`文件后缀之后加一个空格，方法如下：

```shell
t4 = SSHOperator(
    ssh_conn_id='ssh_default', # 指定conn_id
    task_id='ssh_to_other_host',
    command='/bin/bash /tmp/runme.sh ', # 注意在.sh后面有个空格，相传是jinja模板解析问题导致
    dag=dag
)
```

其实看懂paramiko的用法，就能知道`SSHOperator`到底是如何实现ssh的。这里举一个简单的示例：

```python
#!/usr/bin/env python
# filename: ssh_demo.py

import sys, paramiko

if len(sys.argv) < 4:
    print("args missing")
    sys.exit(1)

hostname = sys.argv[1]
password = sys.argv[2]
command = sys.argv[3]

username = "master"
port = 22

try:
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.WarningPolicy)

    client.connect(
        hostname,
        port=port,
        username=username,
        password=password
    )

    stdin, stdout, stderr = client.exec_command(command)
    print(stdout.read())
finally:
    client.close()
```

执行后会返回远端服务器的日期：

```shell
$ python ssh_demo.py <hostname> <password> date
```
