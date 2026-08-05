---
title: "20. Evaluation Harness 和 Runtime Harness 有什么区别？"
source: https://www.yuque.com/u28128023/mk3u4m/gm8mk828ls1enkss
exported_at: 2026-07-27
---

# 20. Evaluation Harness 和 Runtime Harness 有什么区别？

## 知识点讲解

### 1. 核心概念

Runtime Harness 负责真实任务执行，Evaluation Harness 负责可重复地测试和评估 Agent。前者面向生产稳定性，后者面向质量度量和版本比较。

二者都可能调用同一个 Agent，但目标不同：Runtime 要把任务做好，Evaluation 要公平、可复现地判断做得怎么样。

### 2. 技术细节

对比如下：

| 维度 | Runtime Harness | Evaluation Harness |
| --- | --- | --- |
| 目标 | 在线执行用户任务 | 离线或在线评估质量 |
| 输入 | 用户请求、真实环境状态 | 测试集、标准答案、评分规则 |
| 关注点 | 稳定性、权限、成本、延迟 | 可复现、覆盖率、指标、对比 |
| 工具 | 真实工具或受控工具 | Mock、record-replay、沙箱工具 |
| 输出 | 最终结果和执行 trace | 指标、失败案例、回归报告 |

Evaluation Harness 通常需要固定模型版本、随机种子、工具返回、测试数据和评分器，否则不同版本之间不可比。Runtime Harness 则更重视容错、审批、限流和用户体验。

现代 Evaluation Harness 不只评最终文本，还会评执行轨迹。它通常包含 datasets、eval runs、graders、trace grading、record-replay 工具环境和回归报告。对 Agent 来说，评测对象包括：是否选对工具、参数是否正确、handoff 是否合理、guardrail 是否命中、是否发生安全违规、router 策略变更是否影响成功率。

| Eval 能力 | 作用 |
| --- | --- |
| Datasets | 固定任务、输入、期望行为、边界案例和红队样本 |
| Eval runs | 在同一环境下比较不同模型、prompt、schema、router 或工具策略 |
| Graders | 自动或半自动评分最终答案、工具调用、状态变化和安全行为 |
| Trace grading | 按 trace 判断过程质量，而不只看最终输出 |
| Record-replay | 固定工具返回和外部环境，降低评测波动 |
| Regression report | 找出升级后新增失败、改善案例和成本/延迟变化 |

Runtime 和 Evaluation 之间应该形成闭环：Runtime 产生线上 trace，经过脱敏、采样、标注后进入离线 datasets；Evaluation 发现的失败模式再反哺 Runtime 的 tool schema、allowed tools、guardrails、router、handoff 和上下文装配策略。OpenAI Agents SDK / AgentKit 中的 tracing、observability 和 eval workflows 就可以理解为这种闭环的参考实现，而不是单纯的日志功能。

## 面试怎么答

> Runtime Harness 是生产运行控制层，负责上下文、工具、状态、权限、预算、guardrail 和终止条件，让 Agent 在线上可靠完成任务。Evaluation Harness 是评测控制层，负责用固定 datasets、固定环境、eval runs 和 graders 评估 Agent 表现。
> 
> 两者会共享部分能力，比如 trace、工具调用和状态记录，但侧重点不同。Evaluation 更强调可复现、可比较和 trace grading，Runtime 更强调安全、稳定、延迟和真实副作用控制。成熟系统会把线上 trace 脱敏后回流为离线评测集，用来评估工具选择、handoff、安全违规和 routing change。

## 高频追问 & 加分点

-   **Q1：为什么评估不能直接用生产 Harness 跑一遍？** 可以复用部分逻辑，但评估需要固定环境和可重复工具结果，否则指标波动难解释。

-   **Q2：Evaluation Harness 需要 mock 工具吗？** 很多场景需要。Mock 或 record-replay 可以避免外部系统波动影响评估结果。

-   **Q3：评估结果如何反哺 Runtime？** 把失败样本转成回归集，把 trace 中的错误模式转成 schema、上下文、工具和限制策略优化。

-   **Q4：为什么 Agent eval 不能只看最终答案？** 因为 Agent 的风险常发生在过程中。最终答案可能正确，但中间发生了越权读取、错误 handoff、危险工具调用、数据外发或不必要循环，必须通过 trace 和 graders 才能评出来。
