---
title: "1. Python 中 list、tuple、dict 的区别？在 Agent 中如何应用？"
source: https://www.yuque.com/u28128023/mk3u4m/xopgckwml4ishvgw
exported_at: 2026-07-27
---

# 1. Python 中 list、tuple、dict 的区别？在 Agent 中如何应用？

## 知识点讲解

![](https://cdn.nlark.com/yuque/0/2026/png/28539630/1777294671496-408db435-4588-4095-ab04-08e9d59b0d40.png)

### 1. 核心概念

Python 三个最基础的容器——list、tuple、dict——看起来都是"装东西的盒子"，但它们的脾气截然不同。

**list** 是可变有序序列。创建后可以随意增删改，append()、pop()、extend() 都没问题。代价是不可哈希，无法当字典的键。

**tuple** 是不可变有序序列。一旦创建，内容就锁死了——这个"锁"让它拥有 list 没有的能力：可以哈希，能当字典键或集合元素。

**dict** 是键值对容器。查询是 O(1)（哈希表），Python 3.7+ 保持插入顺序。键必须是不可变对象，value 随意。

在 Agent 里，这三种容器各有分工：

-   dict 存配置和状态（随时要改）

-   tuple 做工具注册表的键（要求稳定、可哈希）

-   list 记对话历史和日志（有序、可追加）

### 2. 技术细节

| 特性 | list | tuple | dict |
| --- | --- | --- | --- |
| 可变 | ✓ | ✗ | ✓ |
| 有序 | ✓ | ✓ | ✓ (3.7+) |
| 可哈希 | ✗ | ✓ | ✗ |
| 查询复杂度 | O(n) | O(n) | O(1) |

一个典型的 Agent 状态对象，三种容器都会用到：

这里 (category, name) 用 tuple 而不是 list 当 key，原因就一个：list 不可哈希，Python 会直接抛 TypeError。

### 3. 对比与拓展

频繁查询优先用 dict（O(1)），list 的 in 操作是 O(n)——工具数量一多就掉速。需要稳定的 key，优先 tuple；只需要遍历，用 list 就好。

## 代码示例

**工具注册表：dict + tuple key 模式**

**对话历史管理：list 滑动窗口**

## 面试怎么答

> list、tuple、dict 本质区别在一个字：变。list 可变可追加，适合记流水账；tuple 不可变可哈希，适合当字典键；dict 是哈希表，查询 O(1)，适合配置和状态。
> 
> Agent 里的用法分工很清晰。配置用 dict，因为随时要更新参数；工具注册表用 dict + tuple key，因为工具的分类名不能被意外修改；对话历史用 list，因为要按顺序追加。
> 
> 容易踩的坑是用 list 当字典 key——list 不可哈希，Python 直接抛 TypeError。把 \[category, name\] 改成 (category, name) 就能解决。
> 
> 性能上，如果要频繁判断某个元素在不在集合里，用 set 或 dict，O(1)；用 list 是 O(n)，工具多了就是性能坑。

## 高频追问 & 加分点

-   **Q1：为什么 tuple 可以当字典 key，list 不行？** Python 的 dict 要求 key 可哈希（\_\_hash\_\_ 存在且结果稳定）。tuple 内容固定，hash 值不会变；list 可以被修改，hash 值就没意义了——这是 Python 的设计约束，不是 bug。加分点：tuple 里如果嵌了 list，那这个 tuple 也不可哈希了，hash((1, \[2, 3\])) 会报错。

-   **Q2：dict 的插入顺序是什么时候保证的？** Python 3.7+ 正式保证 dict 维护插入顺序（CPython 3.6 就做了，但只是实现细节）。3.7 前如果要有序字典，得用 collections.OrderedDict。

-   **Q3：Agent 配置为什么不用 dataclass？** 两者各有场景。dataclass 更适合字段固定、有类型约束的配置（支持类型检查、IDE 提示）；dict 更适合运行时动态增减字段、需要序列化传给 LLM 的场景。生产里常见的做法是用 dataclass 定义，再转 dict 传 API。

-   **Q4：大量元素判断"是否存在"，list 和 set 差多少？** 差很大。list 的 in 是 O(n)，100 万条数据最坏要查 100 万次；set/dict 的 in 是 O(1)，100 万条和 10 条查的时间差不多。Agent 工具路由表、权限白名单这类"查存在性"的场景，一定要用 dict 或 set。
