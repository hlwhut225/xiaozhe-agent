---
title: "2. Harness 和 LLM、Agent Framework、Agent Runtime 的关系是什么？"
source: https://www.yuque.com/u28128023/mk3u4m/oqrpwggraeht00z6
exported_at: 2026-07-27
---

# 2. Harness 和 LLM、Agent Framework、Agent Runtime 的关系是什么？

## 知识点讲解

### 1. 核心概念

LLM、Agent Framework、Agent Runtime、Harness 经常被混在一起，但它们关注的层次不同。LLM 是智能内核，Framework 是开发抽象，Runtime 是实际运行环境，Harness 是任务执行控制逻辑。

一个简单类比是：LLM 像大脑，Framework 像开发工具箱，Runtime 像车辆和道路，Harness 像驾驶系统，决定什么时候看路、什么时候刹车、什么时候调用导航、什么时候停止。

### 2. 技术细节

四者的边界可以这样拆：

| 概念 | 主要职责 | 典型问题 |
| --- | --- | --- |
| LLM | 生成文本、推理、选择动作 | 模型能力够不够 |
| Agent Framework | 提供 Agent、Tool、Memory 等抽象 | 开发效率高不高 |
| Agent Runtime | 承载执行、并发、部署、资源隔离 | 运行是否稳定 |
| Harness | 控制 Agent Loop、上下文、工具、预算、安全 | 行为是否可控 |

Framework 可能内置 Harness，也可能只提供搭建积木。Runtime 可能执行 Harness，也可能只是容器、任务队列和服务编排。面试时要强调：Harness 是行为控制面，不等同于部署环境。

## 面试怎么答

> LLM 是 Agent 的决策能力来源，但它本身不会管理任务。Agent Framework 提供开发抽象，比如 tool、memory、chain、agent executor。Runtime 负责让这些逻辑在线上跑起来，比如并发、队列、隔离、监控。
> 
> Harness 则是把这些能力串成一次可控执行的控制层：每轮给模型什么上下文，允许调用哪些工具，工具结果怎么反馈，失败怎么处理，什么时候停止，成本和权限怎么限制。它既可以由框架提供，也可以由团队自己实现。

## 高频追问 & 加分点

-   **Q1：Runtime 和 Harness 最大区别是什么？** Runtime 偏“运行在哪里、如何调度资源”，Harness 偏“这一轮任务如何决策和推进”。

-   **Q2：Framework 已经有 AgentExecutor，还需要理解 Harness 吗？** 需要。生产问题通常出在上下文、工具、权限、循环和异常策略，不能只会调用框架默认参数。

-   **Q3：模型升级能替代 Harness 优化吗？** 不能。模型更强可以减少错误，但权限、预算、工具失败、审计和终止仍必须由 Harness 控制。
