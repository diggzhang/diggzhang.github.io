---
layout:     post
title:      "我以为 TanStack 只是前端，直到我看到它直接查 PostgreSQL"
subtitle:   ""
date:       2026-09-28
author:     ""
tags:

---

最近在看一个基于 TanStack 的项目时，我遇到了一个很奇怪的地方。

目录明明是：

```text 
apps/tanstack-app/src/routes/
```

按照我过去的经验，我下意识会把这里理解成“前端”。

结果继续往下看，却出现了：

```ts 
const { order } =
  await import('@libs/database/schema/order')
```

然后直接：

```ts 
const [lastMonthOrders] = await db
  .select({ count: count() })
  .from(order)
```

我当时第一个反应是：

> TanStack 不是前端吗？怎么直接查数据库了？

这个疑问对我来说其实挺有意思。

因为我的第一份工作，接触的正是 Node.js、Express、Koa，以及那个时代非常典型的**前后端分离架构**。

---

## 一、我的第一份工作：从 Express 换到 Koa

我第一份工作接触 Node.js 时，项目最开始使用的是 Express。

那个时候对后端的理解非常直接：

```text 
Request
   │
   ▼
Express
   │
   ├── Middleware
   ├── Router
   ├── Controller
   └── Business Logic
          │
          ▼
       Database
```

Express 很简单。

一个接口可能就是：

```js 
app.get('/api/orders', async (req, res) => {
  const orders = await getOrders()
  res.json(orders)
})
```

对于刚接触 Node.js 的我来说，这种模型很好理解：

```text 
请求进来
  ↓
处理业务
  ↓
查数据库
  ↓
返回 JSON
```

但随着业务量上来，我们开始发现 Express 已经无法很好地满足当时项目的需求。

团队中的工程师们最终项目选择迁移到 Koa。

我当时对这件事情最直观的理解其实很简单：

> **我们需要一个更轻、更现代，也更适合当时 Node 异步模型的框架。**

Koa 的 middleware 洋葱模型尤其漂亮：

```js 
app.use(async (ctx, next) => {
  console.log('before')

  await next()

  console.log('after')
})
```

请求经过：

```text 
                Request
                   │
                   ▼
          ┌── Middleware A ──┐
          │                  │
          │  Middleware B    │
          │       │          │
          │       ▼          │
          │     Router       │
          │       │          │
          │       ▼          │
          │  Middleware B    │
          │                  │
          └── Middleware A ──┘
                   │
                   ▼
                Response
```

当然，**Express 换 Koa 本身并不会神奇地解决所有性能问题**。

真正决定系统吞吐量的还有业务逻辑、数据库、I/O、缓存、Node 版本、部署架构等很多东西。

但在当时那个项目里，Koa 确实成为我们重新组织 Node 服务的重要一步。

---

# 二、那个年代我们坚信一件事情：前后端必须分离

我们的整体架构是典型的：

```text 
                 Internet
                    │
                    ▼
               ┌─────────┐
               │  Nginx  │
               │   / LB  │
               └────┬────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
      Node        Node        Node
      Koa         Koa         Koa
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
              Database / Cache
```

前端是前端。

后端是后端。

双方通过 HTTP API 通信：

```text
React / Vue
      │
      │ HTTP + JSON
      ▼
     API
      │
      ▼
     Koa
      │
      ▼
Database
```

如果后端扛不住怎么办？

答案也非常符合那个年代互联网架构的直觉：

> **横向扩容。**

一台 Node 不够：

```text 
Node
```

那就两台：

```text 
Node
Node
```

还不够？

继续加：

```text 
Node
Node
Node
Node
Node
...
```

理论上，只要应用服务保持尽量无状态，就可以不断复制 Node 实例。

然后在前面放一层负载均衡：

```text 
                 User
                   │
                   ▼
            Load Balancer
             / Nginx
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
    Node-01     Node-02     Node-03
       │           │           │
       └───────────┼───────────┘
                   │
                   ▼
            Redis / Database
```

流量继续增加：

```text 
3 Nodes
   ↓
10 Nodes
   ↓
30 Nodes
   ↓
100 Nodes
```

甚至配合监控指标做动态扩容：

```text 
Traffic ↑
   │
CPU / Load ↑
   │
   ▼
Auto Scaling
   │
   ├── Node
   ├── Node
   ├── Node
   └── Node
```

流量下来，再缩回去。

现在看，这是很标准的 Cloud Native 思想。

但那个时候我们未必会用今天这么多术语描述它。

关心的是一件很朴素的事情：

> **单台机器有极限，那就不要依赖单台机器。**

能参与这样的架构，让我激动不已。

---

# 三、为什么 Node 特别适合这种玩法？

这其实也是当年 Node.js 非常吸引人的地方。

Node 的服务可以做得很轻。

应用实例本身尽可能不保存状态：

```text 
Node Instance
     │
     ├── 接收请求
     ├── 执行业务
     ├── 查 Redis
     ├── 查数据库
     └── 返回 JSON
```

用户 Session 不要死死存在某个 Node 进程里。

文件不要只放本机。

关键状态交给：

```text 
Redis
Database
Object Storage
```

于是 Node 本身就变成一个相对容易复制的计算单元：

```text 
          ┌── Node
          ├── Node
Request ──┼── Node
          ├── Node
          ├── Node
          └── Node
```

哪台挂了？

摘掉。

流量大了？

加机器。

流量小了？

减少实例。

这种架构给我留下了很深的印象。

因为它让我形成了一个持续很多年的 Web 架构直觉：

```text 
Frontend
     │
     │ API
     ▼
Backend Cluster
     │
     ▼
Data Layer
```

三个世界应该明确分开。

---

# 四、前后端分离当时并不是“潮流”，而是真的解决问题

今天很多人看到传统项目：

```text 
Controller
Service
DAO
DTO
REST API
```

会觉得繁琐。

但如果经历过那个阶段，就会知道它为什么会流行。

因为它解决的是非常现实的问题。

前端可以独立开发：

```text 
Web
iOS
Android
小程序
```

它们全部消费同一套 API：

```text 
             Web
              │
             iOS
              │
Android ─── REST API ─── Backend
              │
           小程序
```

后端也可以独立扩容：

```text 
Frontend
    │
    ▼
Gateway / LB
    │
    ├── Backend
    ├── Backend
    ├── Backend
    └── Backend
```

甚至组织架构也可以跟着拆：

```text 
Frontend Team
      │
      │ API Contract
      ▼
Backend Team
      │
      ▼
Infrastructure Team
```

这套架构真正厉害的地方不是“代码漂亮”。

而是：

> **每一层都可以独立变化。**

---

# 五、但后来发现：不是所有系统都需要这么重

问题出现在接触到更多内部业务/SaaS/数据密集型业务越来越多以后。

比如今天只想在后台 Dashboard 显示一个数字：

> 最近一个月订单数量。

数据库其实只需要：

```sql 
SELECT COUNT(*)
FROM orders
WHERE created_at >= ?
```

但是按照经典前后端分离思路，整个调用链可能变成：

```text 
React Component
       │
       ▼
React Query
       │
       ▼
HTTP Client
       │
       ▼
Nginx
       │
       ▼
API Router
       │
       ▼
Controller
       │
       ▼
Service
       │
       ▼
Repository
       │
       ▼
ORM
       │
       ▼
PostgreSQL
```

返回的时候再原路走回来。

对于复杂系统，这是合理的。

但如果只是一个几个人的小团队，在做：

```text 
SaaS
AI 产品
后台管理系统
内部工具
创业 MVP
```

就会开始产生另一个问题：

> **我到底是在实现业务，还是在搬运 JSON？**

我的一位创业公司朋友，要得很明确：开展业务。不仅仅是前后端分离，还要考虑到人工成本。技术复杂度，要取舍。
说实话当时没太理解，后知后觉，技术终究还是要落地导向。

---

# 六、与此同时，React 自己也遇到了问题

React 最初非常擅长：

```text 
State
  │
  ▼
 UI
```

但后来大家发现，Web App 大部分重要数据其实根本不属于浏览器。

比如：

```text 
订单
用户
商品
支付
通知
评论
```

这些东西属于 Server。

于是代码里出现大量：

```js 
useEffect(() => {
  fetch('/api/orders')
    .then(res => res.json())
    .then(setOrders)
}, [])
```

然后很快开始处理：

```text 
loading
error
retry
cache
stale
refetch
dedupe
pagination
mutation
invalidation
```

大家逐渐意识到：

```text 
sidebarOpen = true
```

和：

```text 
orders = getOrders()
```

根本不是一种状态。

前者是：

```text 
Client State
```

后者是：

```text 
Server State
```

React Query 正是在这里爆发。

它开始把：

```text 
fetch
cache
retry
refetch
stale
invalidation
```

统一到：

```ts 
useQuery()
useMutation()
```

里面。

这也是后来 TanStack 故事真正开始的地方。

---

# 七、然后 Router 也开始进入类型系统

随着 TypeScript 普及，又出现了另一个问题。

比如：

```text 
/users/123/orders?page=2&status=paid
```

实际上这里包含很多应用状态：

```text 
123          → userId
page=2       → pagination
status=paid  → filter
```

但传统 Router 很长时间本质还是：

```text 
URL = string
```

于是：

```ts 
navigate('/users/' + id)
```

TypeScript 根本不知道：

```text 
Route 存不存在
参数对不对
Search Params 合不合法
Loader 返回什么
Component 最终拿到什么
```

TanStack Router 做的事情，就是把：

```text 
Route
```

也拉进类型系统：

```text 
Route Tree
    │
    ├── Params
    ├── Search
    ├── Loader
    ├── Context
    └── Component
          │
          ▼
       TypeScript
```

到这里，事情已经开始发生变化了。

---

# 八、大人，时代变了，TanStack Start

现在看到的代码已经变成：

```ts 
const { order } =
  await import('@libs/database/schema/order')

const result = await db
  .select()
  .from(order)
```

十年前的我看到这种代码，大概会立即问：

> 前后端边界呢？

但今天真正的结构其实是：

```text 
                TanStack Start
       ┌───────────────────────────┐
       │                           │
Browser│ React                     │
       │ TanStack Router           │
       │ TanStack Query            │
       │                           │
───────┼──── Server Boundary ──────│
       │                           │
Server │ Server Function           │
       │ Business Logic            │
       │ Drizzle                   │
       │                           │
       └─────────────┬─────────────┘
                     │
                     ▼
                 PostgreSQL
```

前后端边界并没有消失。

变化的是：

> **以前边界由两个项目 + HTTP API 表达，现在可以由 Framework + Bundler + Runtime 表达。**

这对我来说是 TanStack 最有意思的地方。

---

# 九、于是我突然发现：Web 架构似乎绕了一圈

我第一份工作里的世界是：

```text 
                 Nginx
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
      Koa         Koa         Koa
       │           │           │
       └───────────┼───────────┘
                   │
                   ▼
               Database
```

整个公司围绕着这样一个灵活先进的架构展开工作。
我们不断强调：

```text 
Frontend ≠ Backend
```

今天 TanStack Start 的世界却越来越像：

```text 
             Full-stack App
        ┌─────────────────────┐
        │ React               │
        │ Router              │
        │ Query               │
        │─────────────────────│
        │ Server Function     │
        │ ORM                 │
        └──────────┬──────────┘
                   │
                   ▼
               Database
```

第一眼看起来：

> 怎么又把前后端写到一起去了？

但仔细想，其实不是历史倒退。

---

# 十、第一次“放在一起”和今天“放在一起”完全不同

早期 Web：

```text 
Server
 ├── Template
 ├── Business Logic
 └── Database
```

很多时候是因为技术能力有限。

后来前后端分离：

```text 
Frontend
    │
    │ REST API
    ▼
Backend
```

解决了：

```text 
团队解耦
多客户端
独立部署
独立扩容
API 标准化
```

今天 Full-stack TypeScript 又开始把代码整合：

```text 
React
Router
Query
────────────
Server Function
ORM
```

是因为我们已经有：

```text 
TypeScript
Bundler
Vite
SSR
Server Functions
Type-safe ORM
```

能够在：

> **代码靠得很近**

的同时保持：

> **运行时仍然分离。**

所以真正的变化不是：

```text 
分离 → 不分离
```

而更像：

```text 
物理分离
   │
   ▼
逻辑分离
```

---

# 十一、那我第一份工作那套 Node 横向扩容过时了吗？

完全没有。

这是我认为讨论 TanStack 时特别容易忽略的一点。

TanStack Start 改变的是：

```text 
Application Programming Model
```

它没有改变服务器的物理规律。

如果今天一个 TanStack Start 服务流量越来越大，一样可以：

```text
                    LB
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   TanStack      TanStack     TanStack
    Node-01       Node-02      Node-03
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
              Redis / DB
```

继续增长：

```text 
3 instances
     ↓
10 instances
     ↓
50 instances
```

今天可能不再是我当年手工配置服务器。

而变成：

```text 
Docker
Kubernetes
ECS
Cloud Run
Serverless
Edge Runtime
```

但核心思想没有变：

> **应用层尽量无状态，然后横向复制计算节点。**

所以 Express、Koa 那个时代积累下来的架构思想没有消失。

只是 Infrastructure 抽象得越来越高。

---

# 十二、最后再谈一个问题：TanStack 性能真的更好吗？

第一次看到：

```text 
Component
   ↓
Server Function
   ↓
Database
```

很容易产生一种感觉：

> 少了 REST、Controller、Service，所以一定更快。

其实不一定。

因为 Server Function 并没有消灭网络。

浏览器访问服务器仍然要经历：

```text 
Network
   ↓
Serialization
   ↓
Authentication
   ↓
Server Execution
   ↓
Database
   ↓
Serialization
   ↓
Network
```

以前写：

```text 
POST /api/orders
```

现在写：

```text 
createOrder()
```

开发体验可能完全不同。

但物理世界并没有改变。

---

# 十三、TanStack 真正可能改善的，是“数据什么时候加载”

传统 SPA 很容易出现：

```text 
HTML
 ↓
JavaScript
 ↓
React
 ↓
Router
 ↓
Component Mount
 ↓
fetch()
 ↓
API
 ↓
Database
 ↓
Render
```

这会产生典型 Waterfall：

```text 
JS
────────>

          API A
          ────────>

                    API B
                    ────────>

                              Render
```

TanStack Router + Query + SSR 的一个价值，就是更早知道：

> 这个 Route 到底需要什么数据？

于是可以：

```text 
             ┌── Query A ─────────┐
Route ───────┼── Query B ─────────┼── Render
             └── Query C ─────────┘
```

能并行就并行。

再结合：

```text 
Prefetch
Cache
SSR
Streaming
staleTime
Route-level Code Splitting
```

最终改善的是用户感知性能。

这和：

> Koa 比 Express 每秒多处理多少请求

已经是两个完全不同层面的性能问题了。

---

# 十四、而 TanStack 同样可以被写得很慢

比如：

```text 
Route
 ↓
Loader
 ↓
Server Function
 ↓
Component
 ↓
Query
 ↓
Server Function
 ↓
Child Component
 ↓
Query
```

一样可以制造严重的 Request Waterfall。

或者：

```text 
SSR 请求一次
     ↓
Hydration
     ↓
客户端又请求一次
     ↓
Mutation
     ↓
invalidateQueries('*')
     ↓
全部重新请求
```

于是：

```text 
一次页面访问
      │
      ▼
十几个请求
```

再先进的 Framework 也救不了错误的数据模型。

---

# 十五、所以今天看性能，我已经不会只看 Framework Benchmark

第一份工作时，我可能更关心：

```text 
Express
   VS
Koa

QPS 谁高？
```

今天再看一个 TanStack 项目，我反而会看：

```text 
                    Performance
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
      Server           Browser           Data
        │                │                │
      TTFB             Bundle          Waterfall
      CPU              Hydration       Cache Hit
      Memory           LCP             DB Query
      DB Pool          FCP             Duplicate
```

尤其是：

```text 
TTFB
Bundle Size
Hydration Cost
LCP
Request Waterfall
Cache Hit Rate
Database Query Time
```

这些指标放在一起，才是真正的 Web 性能。

---

# 十六、从我的第一份工作到今天

回头看，这条路线非常有意思：

```text
我的第一份工作
      │
      ▼
   Express
      │
      │ 业务需求增长
      ▼
     Koa
      │
      ▼
前后端分离
      │
      ▼
Nginx / Load Balancer
      │
      ▼
Node 横向复制
      │
      ▼
动态扩缩容
      │
      │
      │ 这些年 Web 继续发展
      ▼
React / SPA
      │
      ▼
React Query
      │
      ▼
TanStack Query
      │
      ▼
TanStack Router
      │
      ▼
TanStack Start
      │
      ▼
Full-stack TypeScript
```

当年我学习的是：

> **怎么把前端和后端拆得足够干净。**

今天 TanStack 给我的感觉却是：

> **我们是不是有些东西拆得太远了？**

这并不意味着当年的架构错了。

恰恰相反。

如果没有前后端分离、无状态服务、负载均衡、横向扩容这些思想，就不会有今天的大规模 Web 系统。

TanStack 做的不是推翻它们。

而是在另一个维度重新划分边界。

---

# 结语

从 Express 到 Koa，再到今天的 TanStack，我最大的感受其实不是：

> 哪个 Framework 更先进？

而是 Web 工程一直在做同一件事情：

**移动复杂度。**

Express/Koa 时代，我们把复杂度拆到：

```text 
Frontend
API
Backend
Infrastructure
```

通过 Nginx、负载均衡和大量无状态 Node 实例解决扩展问题：

```text 
                    Traffic
                       │
                       ▼
                  Nginx / LB
                       │
           ┌───────────┼───────────┐
           ▼           ▼           ▼
         Node        Node        Node
           │           │           │
           └───────────┼───────────┘
                       ▼
                    Data
```

今天 TanStack 又尝试把 Application Layer 重新拉近：

```text 
             TypeScript
                 │
       ┌─────────┴─────────┐
       │                   │
     Client              Server
       │                   │
     React          Server Function
       │                   │
     Router               ORM
       │                   │
     Query              Database
```

但底层那些老问题一个都没有消失：

```text 
网络延迟
并发
数据库瓶颈
缓存
无状态
负载均衡
横向扩容
故障恢复
```

所以十几年以后再看 TanStack，我反而更能理解它为什么会出现。

**它不是证明“前后端分离错了”。**

它真正提出的问题是：

> 当 TypeScript、Bundler、SSR、Server Function 和 ORM 都已经成熟以后，我们还有必要为了保持边界，而支付过去那么高的工程成本吗？

答案最终不会由 Framework 的宣传页决定。

而会由真实项目回答：

```text 
开发更快了吗？
       │
系统更简单了吗？
       │
性能更好了吗？
       │
扩容还容易吗？
       │
出了问题还能定位吗？
       │
团队变大以后还能维护吗？
```

如果这些问题都能得到好的答案，那么 TanStack 代表的 Full-stack TypeScript 才真正完成了一次架构进化。

否则，我们只是把当年清清楚楚写在：

```text 
Nginx
API
Controller
Service
```

里的复杂度，

藏进了一个更加现代、更加漂亮的框架里。

**技术很少真正消灭复杂度。**

**它更多时候，只是在决定我们下一次会在哪里遇见复杂度。**
