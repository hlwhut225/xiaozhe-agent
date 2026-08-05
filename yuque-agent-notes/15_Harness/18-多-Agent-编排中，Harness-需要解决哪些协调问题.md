---
title: "18. 多 Agent 编排中，Harness 需要解决哪些协调问题？"
source: https://www.yuque.com/u28128023/mk3u4m/qbcldzmkl59y8hdy
exported_at: 2026-07-27
---

# 18. 多 Agent 编排中，Harness 需要解决哪些协调问题？

## 知识点讲解

### 1. 核心概念

多 Agent 编排的难点不是“创建多个 Agent”，而是让多个 Agent 有序协作。没有 Harness 协调，多 Agent 很容易变成多个模型互相聊天：信息重复、职责重叠、结论冲突、成本膨胀。

Harness 要把协作变成可控流程，而不是开放式讨论。

### 2. 技术细节

核心协调问题包括：

| 问题 | Harness 需要做什么 |
| --- | --- |
| 任务分解 | 把全局目标拆成可分配子任务 |
| 角色边界 | 定义每个 Agent 的职责、工具和权限 |
| 消息路由 | 决定谁能看到哪些消息和结果 |
| 共享状态 | 管理全局进度、依赖和产物 |
| 冲突解决 | 处理不同 Agent 的结论不一致 |
| 调度策略 | 串行、并行、投票、审查、主管模式 |
| 成本控制 | 防止多个 Agent 同时消耗预算 |

常见模式有 Supervisor、Planner-Executor、Debate、Reviewer、Map-Reduce。模式选择应服务任务结构，而不是盲目追求复杂。

现代多 Agent 编排还会混合 workflow graph 和 LLM routing。确定性节点适合做权限校验、数据转换、审批等待、状态合并；LLM router 适合处理意图分类、专家选择和异常分流；handoff 适合把控制权交给专门 agent；human-in-the-loop 适合处理高风险、不确定或合规要求强的步骤。

Harness 需要特别关注 handoff 的几个细节：

| 协调点 | 说明 |
| --- | --- |
| Handoff contract | 明确交接目标、已知事实、未完成事项、可用工具和退出条件 |
| State merge | 子 agent 结果如何写回全局状态，冲突时谁有权覆盖 |
| Guardrail boundary | 转交前后重新跑权限、数据范围、输出安全和工具安全检查 |
| Trace linkage | 父任务、子任务、路由原因、agent 选择和结果合并都要可追踪 |
| Evaluation signal | 后续评估要能判断是路由错、agent 错、工具错还是合并错 |

多 Agent 中的 connector 和 MCP tool 也不能全局共享。研究 agent 可能只能读资料，执行 agent 才能写系统，审批 agent 只能批准或拒绝。Harness 要按角色和任务阶段动态计算 allowed tools，而不是把所有工具都交给所有 agent。

## 面试怎么答

> 多 Agent Harness 要解决的核心是协调：任务怎么拆，角色怎么分，消息怎么传，状态怎么共享，handoff 怎么发生，冲突怎么仲裁，最终结果怎么合并。
> 
> 我会优先定义每个 Agent 的职责、allowed tools 和权限，避免所有 Agent 都能做所有事。然后用共享任务状态记录子任务进度，用 workflow node、router、handoff 和调度策略控制并行或串行执行。对结论冲突，可以引入 reviewer、投票或基于证据的仲裁机制，并通过 trace 判断到底是路由、工具、状态还是合并环节出了问题。

## 高频追问 & 加分点

-   **Q1：Supervisor 模式有什么优缺点？** 优点是控制清晰，缺点是主管 Agent 容易成为瓶颈和单点误判来源。

-   **Q2：多 Agent 如何共享上下文？** 不建议全量共享。应共享任务状态和关键产物，局部细节按需路由。

-   **Q3：怎么控制多 Agent 成本？** 子任务预算、并发限制、早停策略、结果复用和低成本模型分层。

-   **Q4：多 Agent 的评测为什么更难？** 因为最终答案失败不一定说明最后一个 agent 错，可能是任务分解、路由、handoff 上下文、工具权限或状态合并错。评测需要看 trace，而不只是看最终输出。
