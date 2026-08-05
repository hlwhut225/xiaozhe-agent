---
title: "5. 什么是 Agent Loop？它的基本流程是什么？"
source: https://www.yuque.com/u28128023/mk3u4m/zoua3ukblorilbio
exported_at: 2026-07-27
---

# 5. 什么是 Agent Loop？它的基本流程是什么？

## 知识点讲解

### 1. 核心概念

Agent Loop 是 Agent 执行多步任务的核心循环。它不是一次模型调用，而是“观察环境、思考下一步、执行动作、接收结果、继续判断”的重复过程。

传统 Chatbot 通常是一问一答；Agent Loop 允许系统在没有用户每步干预的情况下，持续推进任务。

但要注意，LLM loop 不等于 workflow graph。Loop 是“每轮由模型或策略决定下一步”的执行机制；workflow graph 是“预先定义节点和边”的流程结构。现代 Harness 常常把两者混合使用：确定性节点处理稳定流程，LLM 节点处理开放判断，router 节点做路由，handoff 节点把任务转交给其他 agent，human-in-the-loop 节点等待人工审批或补充信息。

### 2. 技术细节

典型 Agent Loop 可以抽象为：

| 阶段 | 说明 |
| --- | --- |
| Observe | 收集用户目标、当前状态、工具结果和历史步骤 |
| Decide | 调用模型决定下一步：回答、调用工具、请求澄清或终止 |
| Act | 执行工具、检索、写入状态或触发审批 |
| Update | 把结果写回上下文和状态 |
| Stop Check | 检查是否完成、失败、超限或需要人工介入 |

Loop 的关键不是“循环起来”，而是每一轮都要有边界：可用工具、上下文窗口、预算、权限、最大步数、异常策略和终止条件。

在现代 Agent runtime 中，Loop 还要处理几类特殊分支：

| 分支 | 含义 |
| --- | --- |
| Deterministic workflow node | 不调用模型，按规则执行校验、转换、写状态、调用固定服务 |
| Router | 根据任务类型、用户权限、风险等级或模型判断选择下一节点 |
| Handoff | 把控制权转交给另一个 agent 或专门角色，并带上必要状态 |
| Tool approval | 工具调用触发审批，Loop 暂停等待用户或管理员确认 |
| Guardrail tripwire | 输入、输出或工具调用命中安全规则，阻断、降级或转人工 |

OpenAI Agents SDK 这类框架里的 handoffs、guardrails、sessions/results/state、tracing，都是围绕这个 Loop 展开的运行时能力：谁接手、能不能继续、状态如何保存、每一步如何复盘。

## 面试怎么答

> Agent Loop 是 Agent 从单次问答变成多步执行的机制。每一轮通常会先观察当前上下文和状态，再让模型或策略决定下一步动作，如果是工具调用就执行工具并把结果写回状态，然后检查任务是否完成或是否触发 step、token、time、cost 等限制。
> 
> 一个好的 Loop 不是让 LLM 无限决定一切，而是把 LLM 决策、确定性 workflow 节点、router、handoff、human-in-the-loop 和 guardrail 组合起来。它必须有明确终止条件和异常处理，否则 Agent 很容易重复调用同一个工具、在错误信息上来回解释，或者为了追求更完整答案不断消耗 token。

## 高频追问 & 加分点

-   **Q1：ReAct 和 Agent Loop 是什么关系？** ReAct 是一种把 reasoning 和 acting 交替组织的模式，Agent Loop 是更通用的执行结构。

-   **Q2：Loop 每轮都必须调用 LLM 吗？** 不一定。有些步骤可以由规则、状态机或工具结果直接决定，以降低成本和延迟。

-   **Q3：Loop 什么时候应该停止？** 任务完成、无法继续、需要用户澄清、触发安全拦截、达到预算或达到最大步骤时都应停止。

-   **Q4：Handoff 和普通工具调用有什么区别？** 工具调用是当前 Agent 调用外部能力；handoff 是把任务控制权交给另一个 Agent 或角色，通常会改变指令、工具集合、权限边界和后续 trace 归属。
