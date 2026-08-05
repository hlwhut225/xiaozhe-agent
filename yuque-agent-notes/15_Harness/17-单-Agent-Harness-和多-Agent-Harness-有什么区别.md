---
title: "17. 单 Agent Harness 和多 Agent Harness 有什么区别？"
source: https://www.yuque.com/u28128023/mk3u4m/hb00va0up4aqtcld
exported_at: 2026-07-27
---

# 17. 单 Agent Harness 和多 Agent Harness 有什么区别？

## 知识点讲解

### 1. 核心概念

单 Agent Harness 管理一个 Agent 的多步执行；多 Agent Harness 管理多个 Agent 之间的分工、通信、调度和冲突解决。两者的核心差异不是 Agent 数量，而是控制问题从“单个循环”变成“协同系统”。

单 Agent 关注任务能否完成，多 Agent 还要关注协作是否高效、角色是否清晰、结果是否一致。

### 2. 技术细节

对比如下：

| 维度 | 单 Agent Harness | 多 Agent Harness |
| --- | --- | --- |
| 控制对象 | 一个 Agent Loop | 多个 Agent Loop 或角色节点 |
| 状态 | 单任务状态 | 共享状态、局部状态、消息状态 |
| 调度 | 下一步动作 | 谁先做、谁等待、谁合并 |
| 风险 | 死循环、工具误用 | 角色冲突、信息不一致、成本放大 |
| 终止 | 单一任务完成 | 子任务完成和全局目标完成 |

多 Agent 不一定更强。很多任务用单 Agent 加好工具就够了。只有当任务天然需要分工、审查、并行或多视角决策时，多 Agent 才有明显价值。

现代框架里的 handoff 可以看成单 Agent 和多 Agent 之间的关键桥梁。一个系统可能表面上是单入口 Agent，但内部通过 router 把任务转给研究 agent、代码 agent、审批 agent 或客服 agent。此时 Harness 不仅要管理“有几个 Agent”，还要管理控制权如何转移、状态如何裁剪、工具权限如何变化、trace 如何串起来。

| 能力 | 单 Agent 常见做法 | 多 Agent / handoff 常见做法 |
| --- | --- | --- |
| 指令 | 单一系统指令 | 每个 agent 有独立职责和边界 |
| 工具 | 一个动态工具集合 | 每个 agent 暴露不同 allowed tools |
| 状态 | 单任务状态 | 全局状态 + agent 局部状态 |
| 路由 | 当前 loop 决定下一步 | router / supervisor / workflow graph 决定谁接手 |
| 安全 | 单一权限上下文 | handoff 时重新校验权限、数据和工具 |
| Trace | 一条执行链 | 父 trace 串联子 agent trace 和 handoff 事件 |

多 Agent Harness 也不等于所有步骤都由 LLM 自由聊天。更稳定的做法是把确定性 workflow node、router、handoff、guardrail 和 human-in-the-loop 组合起来，让多 Agent 协作有明确边界。

## 面试怎么答

> 单 Agent Harness 主要控制一个 Agent 的上下文、工具、状态和循环。多 Agent Harness 除了这些，还要解决角色分工、消息传递、共享状态、执行调度、handoff、结果合并和冲突解决。
> 
> 多 Agent 的难点是协作成本和一致性。每次 handoff 都可能改变指令、工具、权限和上下文，必须由 Harness 做路由、状态裁剪、权限重检和 trace 串联。Agent 越多，token 成本、延迟和冲突都会上升，所以不能为了架构好看就引入多 Agent。只有在任务可并行、需要专家分工或需要审查机制时才值得用。

## 高频追问 & 加分点

-   **Q1：多 Agent 一定比单 Agent 好吗？** 不一定。多 Agent 会增加通信和协调成本，简单任务反而更慢更贵。

-   **Q2：多 Agent Harness 最核心的新增能力是什么？** 调度和协调，包括任务分解、消息路由、共享状态和冲突仲裁。

-   **Q3：什么时候适合多 Agent？** 复杂研究、代码审查、规划执行分离、多角色审批、并行信息收集等场景。

-   **Q4：handoff 会带来什么风险？** 主要是上下文过量传递、权限越界、状态丢失和责任不清。Harness 应传最小必要状态，并在新 agent 接手前重新计算 allowed tools 和数据范围。
