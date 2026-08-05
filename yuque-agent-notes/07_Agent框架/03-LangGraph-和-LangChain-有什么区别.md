---
title: "3. LangGraph 和 LangChain 有什么区别？"
source: https://www.yuque.com/u28128023/mk3u4m/pf5zflqgkoc131p3
exported_at: 2026-07-27
---

# 3. LangGraph 和 LangChain 有什么区别？

## 知识点讲解

### 1. 核心概念

两者来自同一个团队，但解决的是不同层次的问题。

**LangChain** 是应用框架——提供 LLM 调用、工具集成、Memory、LCEL 链等基础能力，用来把各种组件粘在一起。早期的 AgentExecutor 已经能跑 ReAct 循环，但状态管理是隐式的，流程稍复杂就容易失控。

**LangGraph** 是工作流编排库——把 Agent 流程建模成图（节点 + 边），显式管理全局状态，支持 DAG、循环、条件路由、暂停/恢复。它解决的问题是：**当你需要精细控制 Agent 执行路径时，LangChain 的抽象太高、力道不够**。

两者不是替代关系。LangGraph 的每个节点里可以用 LangChain 的 LLM、Tools、Prompt 等，它们是分层协作的。

### 2. 技术细节

**核心差异对比**

| 维度 | LangChain | LangGraph |
| --- | --- | --- |
| 基础单位 | Chain / Runnable | Node + Edge |
| 流程模型 | 线性 / 简单分支 | DAG + 循环 |
| 状态管理 | 隐式，传参 | 显式全局状态 TypedDict |
| 条件路由 | LCEL 分支 | Conditional Edges |
| 暂停 / 恢复 | 不支持 | Checkpointing 原生支持 |
| Human-in-the-Loop | 绕路实现 | interrupt() 原生支持 |
| 可调试性 | 中 | 高（状态快照可检查） |

**LangGraph 四个核心概念**

1.  **State**：TypedDict 定义的全局状态对象，所有节点读写同一份状态

1.  **Node**：执行单元，接收当前 State，返回 State 的局部更新（字典 merge）

1.  **Edge**：节点间的连线；普通边是固定跳转，条件边根据状态动态路由

1.  **Checkpoint**：每个节点执行后自动保存状态快照，支持任意点恢复

**什么时候该用 LangGraph**

-   需要循环（ReAct 循环、重试循环）

-   需要状态在节点间透明传递和可检查

-   需要 Human-in-the-Loop 中断点

-   多 Agent 协作，需要精细控制消息路由

-   需要在任意节点失败后恢复，而不是从头跑

**什么时候继续用 LangChain**

-   单链 RAG，流程固定

-   快速原型，不需要状态管理

-   LCEL 链已经够用

### 3. 对比与拓展

LangGraph 和 Airflow/Temporal 这类工作流引擎的对比：LangGraph 专注 AI 工作流，轻量、代码优先，适合实时 Agent；Airflow 是批处理和数据管道的重型工具，两者定位不同。

## 代码示例

## 面试怎么答

> LangChain 和 LangGraph 是同一个团队的两层产品，分别解决不同的问题。LangChain 是组件库——LLM 调用、工具、Memory、LCEL 链，帮你把零件拼起来。LangGraph 是工作流编排——把 Agent 执行过程建模成图，显式管理状态、支持循环和条件路由。
> 
> 核心区别就一条：**状态管理是否显式**。LangChain 的 AgentExecutor 跑 ReAct 循环时状态是隐式的，你不知道每一步 Agent 的内部状态是什么；LangGraph 把状态定义成 TypedDict，每个节点都在读写同一份状态，随时可以 checkpoint 拿出来看。
> 
> 什么时候选 LangGraph？需要循环（ReAct 或重试）、需要 Human-in-the-Loop 中断、需要多 Agent 精细路由、需要故障恢复。这几个场景下 LangChain 的 AgentExecutor 力道不够，LangGraph 才是对的工具。
> 
> 生产项目里我的做法是：用 LangGraph 做骨架（管控制流和状态），节点内部用 LangChain 的 LLM、Tools、Prompt——两者搭配，不是二选一。

## 高频追问 & 加分点

-   **Q1：Checkpointing 在哪些场景真正有用？** 两类：一是长时间运行的任务（几分钟到几小时），节点失败后不用从头跑；二是 Human-in-the-Loop，Agent 执行到某步需要人审批，暂停 → 人工确认 → 恢复，这个流程没有 checkpointing 做不了。

-   **Q2：LangGraph 的 State 和普通全局变量有什么区别？** 不是替代全局变量的，而是把状态结构化、版本化。每次节点返回的是 State 的"局部更新字典"，LangGraph 负责合并——这意味着同一个 State 在不同 checkpoint 有不同版本，可以回放任意历史节点的状态。

-   **Q3：条件边写复杂了会不会变成一团糟？** 确实会。条件边多了之后图就很难读。我的经验是：超过 5 个条件节点，就把子流程抽出来成独立的子图（LangGraph 支持子图嵌套），主图只保留高层逻辑。另外 LangSmith 可以可视化整个图，调试时很有帮助。

-   **Q4：LangGraph 怎么实现多 Agent 协作？** 两种模式。Supervisor（中央编排）：一个 Supervisor 节点持有所有 Agent，根据状态决定把任务派给哪个 Worker Agent，每个 Worker 是独立的子图。Handoff（接力）：Agent A 完成后通过状态传递给 Agent B，用条件边控制谁接手。前者更像 CrewAI，后者更像 Pipe。

-   **Q5：和 Temporal、Airflow 比，LangGraph 的边界在哪？** LangGraph 是代码优先、适合实时 AI 工作流，没有 UI 调度、没有 SLA 管理、没有历史任务存储这些企业级特性。长时间批处理任务（跑几个小时的数据 pipeline）还是该用 Airflow/Temporal。LangGraph 适合的是"单次 Agent 会话"级别的工作流，不是跨天跨周的任务调度。
