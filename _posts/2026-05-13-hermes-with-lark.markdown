---
layout:     post
title:      "Hermes Agent 飞书机器人：私聊正常，群聊不响应的真正原因"
subtitle:   ""
date:       2026-05-12
author:     ""
tags:

---


最近接入 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 的飞书机器人时，遇到一个非常迷惑的问题：

* 私聊机器人：正常
* 群里 `@bot hi`：完全没反应
* Hermes 日志里甚至没有 group message

第一反应通常会怀疑：

* 飞书权限没开
* 事件订阅有问题
* WebSocket 没连上
* 机器人没加群
* Hermes Feishu adapter 有 bug

结果都不是。

真正的问题只有一行配置：

```env
FEISHU_GROUP_POLICY=open
```

---

# 问题现象

飞书后台权限全部正常：

* `im.message.receive_v1`
* 获取群组中用户 @ 机器人消息
* 获取群组中所有消息

私聊能正常触发：

```text
Inbound dm message received
```

但群里：

```text
@bot hi
```

完全没任何日志。

这个现象特别容易误导人。

因为看起来像：

> 飞书根本没把 group event 推送给 Hermes。

实际上并不是。

---

# 真正原因

Hermes Feishu gateway 默认配置是：

```python
group_policy=os.getenv(
    "FEISHU_GROUP_POLICY",
    "allowlist"
)
```

默认值：

```env
FEISHU_GROUP_POLICY=allowlist
```

也就是说：

> Hermes 默认不会自动处理所有群消息。

在 `allowlist` 模式下：

* 群不在白名单
* 用户不在 allowlist
* mention gating 不满足

消息会被直接过滤。

于是你看到的现象就是：

* 私聊正常
* 群聊完全没反应
* 日志里甚至没有 raw message

非常像“飞书事件没推过来”。

但其实：

> 是 Hermes 自己静默 drop 了 group event。

---

# 解决方案

在 `.env` 里增加：

```env
FEISHU_GROUP_POLICY=open
FEISHU_ALLOW_BOTS=all
```

然后重启：

```bash
hermes restart
```

立刻恢复正常。

群里：

```text
@bot hi
```

马上能收到回复。

---

# 为什么这个问题很坑

因为你会在错误方向排查很久：

* 飞书开放平台
* 权限
* 事件订阅
* WebSocket
* 机器人权限

实际上这些可能全是对的。

真正的问题只是：

```env
FEISHU_GROUP_POLICY
```

默认值太“保守”。

---

# 一个经验

如果你遇到：

* 飞书私聊正常
* 群 `@bot` 完全无响应
* Hermes 没 group raw log

先检查：

```env
FEISHU_GROUP_POLICY
```

别先折腾飞书后台。

---

相关 issue：

[Hermes Issue #6889](https://github.com/NousResearch/hermes-agent/issues/6889?utm_source=chatgpt.com)
