---
title: "4. 一个基础 Agent Harness 通常包含哪些核心组件？"
source: https://www.yuque.com/u28128023/mk3u4m/yftxoonhpeytm0hz
exported_at: 2026-07-27
---

# 4. 一个基础 Agent Harness 通常包含哪些核心组件？

## 知识点讲解

### 1. 核心概念

基础 Agent Harness 的目标不是“让模型多说几句话”，而是把一次任务执行拆成可管理的生命周期。它要能启动任务、组织上下文、调用模型、执行工具、更新状态、判断是否结束，并把全过程记录下来。

如果把 Agent 看成一个长事务，Harness 就是事务管理器。

### 2. 技术细节

一个基础 Harness 通常包含这些组件：

| 组件 | 作用 |
| --- | --- |
| Task Manager | 接收任务、初始化目标、记录任务元数据 |
| Context Builder | 组装系统指令、用户输入、历史步骤、检索结果 |
| Model Caller | 调用 LLM，解析模型输出或 tool call |
| Tool Registry | 管理工具列表、schema、权限和调用入口 |
| State Store | 保存任务进度、变量、临时结果和执行状态 |
| Loop Controller | 控制 step limit、终止条件、重试策略 |
| Guardrail | 做输入输出过滤、权限校验和风险拦截 |
| Observer | 记录日志、指标、trace、成本和错误 |

放到 2025-2026 的 Agent runtime 语境里，这些组件通常会对应到更明确的产品或框架概念。比如 OpenAI Agents SDK 里的 agent 定义、handoffs、guardrails、sessions/results/state、tracing/observability，可以理解为 Harness 的角色定义、转交机制、安全护栏、会话状态和可观测性能力；AgentKit 里的 Agent Builder、ChatKit、Connector Registry 更偏向“构建、交互入口、连接器治理”的上层组合；sandbox agents 和 eval workflows 则分别对应隔离执行和评测控制。它们不是 Harness 的全部，但能作为现代 Harness 的参照系。

也就是说，今天的 Harness 不再只是“prompt + while loop + function call”。它通常还要管：

| 现代能力 | 在 Harness 中的归属 |
| --- | --- |
| Agent / sub-agent | 角色、指令、模型、工具和权限边界 |
| Handoff / router | 任务转交、路由和多角色协作 |
| Session / result / state | 会话连续性、任务状态、执行结果和恢复 |
| Guardrails | 输入、输出、工具调用前后的风险控制 |
| Connector / MCP server | 外部工具运行时、信任边界和数据外发控制 |
| Sandbox | 浏览器、computer-use、shell、代码执行等隔离环境 |
| Tracing / eval | 线上可观测性、离线评测和回归分析 |

面试时重点不是背组件名，而是说清楚这些组件覆盖了 Agent 执行的完整闭环。

## 面试怎么答

> 一个基础 Agent Harness 至少要有上下文构建、模型调用、工具注册与执行、状态管理、循环控制、安全护栏和可观测性。上下文构建决定模型看到什么，工具注册决定它能做什么，状态管理决定任务推进到哪里，循环控制决定什么时候继续或停止。
> 
> 生产里还会加权限审批、MCP/Connector 工具治理、沙箱执行、预算限制、trace 和 eval 埋点。类似 Agents SDK / AgentKit 里的 agents、handoffs、guardrails、sessions、tracing、Connector Registry、eval workflows，本质上都可以映射到 Harness 的角色、路由、安全、状态、工具和评测能力上。否则 Agent 可能能跑 demo，但很难在线上稳定服务。

## 高频追问 & 加分点

-   **Q1：最小可用 Harness 可以少到什么程度？** 至少需要任务输入、模型调用、工具执行、循环控制和终止条件。没有终止条件就不是可控系统。

-   **Q2：哪些组件最容易被低估？** Context Builder 和 Observer。前者影响模型判断，后者决定出了问题能不能定位。

-   **Q3：State Store 一定要持久化吗？** 不一定。短任务可以内存保存，长任务、异步任务和可恢复任务需要持久化。

-   **Q4：Agent Builder、ChatKit、Connector Registry 属于 Harness 吗？** 它们更像 Harness 上层或周边能力：Agent Builder 帮助配置 agent/workflow，ChatKit 提供用户交互入口，Connector Registry 管理外部连接器。底层仍需要 Harness 执行状态、工具、权限、trace 和安全控制。
