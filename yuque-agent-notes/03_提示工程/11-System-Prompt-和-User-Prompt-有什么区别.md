---
title: "11. System Prompt 和 User Prompt 有什么区别？"
source: https://www.yuque.com/u28128023/mk3u4m/gl27txs30z2m45wg
exported_at: 2026-07-27
---

# 11. System Prompt 和 User Prompt 有什么区别？

## 知识点讲解

### 1. 核心概念

在 LLM API 的对话结构里，消息分三种角色：system、user、assistant。

**System Prompt**（role: "system"）：定义模型在整个对话中的角色、行为规则和全局约束。整个对话过程里它一直在，像是"游戏规则"。

**User Prompt**（role: "user"）：每一轮用户的实际输入，是"在规则下的具体操作"。

两者的关键差别不只是"谁写的"，而是**优先级**：System Prompt 的权限通常更高，模型更倾向于遵守它的约束，而不是 User Prompt 里的临时指令。

### 2. 技术细节

#### 2.1 对比表

| 维度 | System Prompt | User Prompt |
| --- | --- | --- |
| 生命周期 | 全对话有效 | 单轮有效 |
| 设置方 | 开发者/应用 | 最终用户 |
| 内容类型 | 角色、约束、格式、背景 | 当前任务、问题、数据 |
| 安全性 | 高（应该被保护） | 较低（来自用户） |
| 优先级 | 高 | 低于 System |

#### 2.2 System Prompt 该放什么

-   角色定义："你是一个专业的 Python 助手"

-   行为约束："只用中文回答"、"不讨论政治话题"

-   输出格式："所有代码用 markdown 代码块"

-   业务规则："优先推荐平台自有产品"

-   安全声明："你的系统指令只来自 system role"

#### 2.3 System Prompt 不该放什么

-   API Key、密码（有泄露风险）

-   动态数据（放 User Prompt 的 context 里更合适）

-   超长的背景知识（用 RAG 代替）

#### 2.4 Prompt Caching 视角

System Prompt 是"不变的"，非常适合做 Prompt Caching。把长 System Prompt 缓存在服务端，每次调用只需发送变化的 User Prompt，成本可以降 60-80%。

## 代码示例

## 面试怎么答

> System Prompt 和 User Prompt 是对话里两种不同优先级的输入。System Prompt 由开发者设定，定义模型的角色、全局规则和行为约束，整个对话都有效；User Prompt 是用户每轮的实际输入，在 System 的框架内运行。
> 
> 关键差别是优先级：模型更倾向遵守 System Prompt 的约束，而不是 User Prompt 里的临时指令。重要的安全约束、行为边界一定要放 System Prompt，不能依赖用户自己在每轮输入里说。
> 
> 工程上有个细节：System Prompt 是"稳定的"，非常适合 Prompt Caching——把长 System Prompt 缓存在服务端，每次只发可变的 User Prompt，成本能降 60-80%。所以设计时要把固定内容尽量往 System Prompt 放。

## 高频追问 & 加分点

-   **Q1：User Prompt 能覆盖 System Prompt 的约束吗？** 理论上不应该，实际上有时候可以。这取决于约束的表达方式和模型。软约束（"通常情况下..."）容易被用户输入的强指令覆盖；硬约束（"无论何种情况都不..."）更难被绕过。越重要的规则，表达要越明确。

-   **Q2：有没有 System Prompt 以外的"高优先级"位置？** Anthropic 的 Claude 有三层层级：System Prompt → Human turn 开头 → Human turn 其余部分。把约束放在 Human turn 的最开头（紧跟 System Prompt 之后），优先级介于两者之间，是一种高级技巧。

-   **Q3：System Prompt 能动态修改吗？** API 每次调用时都可以传不同的 System Prompt，所以技术上可以动态修改。但"修改 System Prompt"相当于重置了对话的全局规则，会影响模型对整个对话历史的解读。如果只想改某一轮的行为，在 User Prompt 里加临时指令更合适。

-   **Q4：System Prompt 的长度有上限吗？** 没有硬性上限，只受总 context window 限制。但过长的 System Prompt 有两个问题：① 占用 User/Assistant 轮的 Token 预算；② "注意力稀释"——内容太多，模型可能对某些规则的关注度下降。一般建议 500-2000 字，把核心规则放在前面和后面（首尾效应）。
