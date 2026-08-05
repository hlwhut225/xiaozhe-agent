---
title: "16. 如何用 Python 实现一个简单的 Agent？（ReAct 风格）"
source: https://www.yuque.com/u28128023/mk3u4m/rec3dfl02fac5hta
exported_at: 2026-07-27
---

# 16. 如何用 Python 实现一个简单的 Agent？（ReAct 风格）

## 知识点讲解

### 1. 核心概念

ReAct（Reasoning + Acting）是目前最主流的 Agent 实现范式。每一步 LLM 输出三件事：

这三步循环，直到 LLM 输出 Final Answer。

ReAct 的优势是简单——不需要提前规划，每步根据 observation 重新决策，适合短任务和强环境交互（每步都依赖上一步的返回）。

**两种 ReAct 实现方式**：

1.  **文本解析式（Prompt 版）**：LLM 输出文本，Agent 用正则/字符串解析出 Action；早期 LangChain 就是这样

1.  **Function Calling 式**：LLM 直接返回结构化的工具调用，更可靠，现在是主流

### 2. 技术细节

ReAct 循环的核心控制流：

四个工程要点：

1.  **历史轨迹管理**：把每步的 Thought/Action/Observation 追加进去，LLM 靠这些上下文做下一步决策

1.  **max\_steps 上限**：防止无限循环，一般设 10-20

1.  **工具注册表**：名字到函数的映射，解析到工具名后直接查表调用

1.  **错误处理**：工具调用失败要把错误信息作为 Observation 返回给 LLM，让它重试或换策略

### 3. 对比与拓展

ReAct vs Plan-and-Execute：ReAct 每步局部决策，灵活但可能绕弯路；Plan-and-Execute 先出完整计划，全局视角但中途环境变了要 replan。短任务用 ReAct，中长任务用混合方案。

## 代码示例

**Function Calling 版 ReAct Agent（Anthropic SDK）**

**轨迹记录（可观测性）**

## 面试怎么答

> ReAct 是最常用的 Agent 范式，核心是三步循环：LLM 思考（Thought）→ 决定动作（Action）→ 执行工具拿结果（Observation），然后把结果加进历史，再让 LLM 决定下一步。
> 
> 现在实现 ReAct 有两种路：一是文本解析式，LLM 输出文本再用正则提取工具调用——脆，容易解析失败；二是 Function Calling 式，LLM 直接返回结构化的工具调用参数——可靠，现在是主流。我一般用 Function Calling。
> 
> 工程上必须设 max\_steps 上限，不然 LLM 陷入无效循环会一直烧 token。工具执行失败时，要把错误信息作为 Observation 返回给 LLM，让它自己决定是重试还是换策略——不要直接抛异常终止。

## 高频追问 & 加分点

-   **Q1：ReAct 和 LangChain Agent 什么关系？** LangChain 的 Agent（早期版）就是文本解析式 ReAct 的实现，AgentExecutor 是循环控制框架，Tool 是工具封装。LangGraph 是后来的版本，把 ReAct 循环显式表达成状态机图，控制流更清晰。理解 ReAct 的核心循环，LangChain/LangGraph 的代码就看得懂了。

-   **Q2：ReAct 的 Thought 能提升效果吗？** 是的，这就是 Chain-of-Thought 在 Agent 里的应用。让 LLM 在 Action 前先输出 Thought（推理过程），强制它"想清楚再动手"，能明显降低工具调用出错率。实验结果显示，有 Thought 的 ReAct 比没有 Thought 的准确率高 10-20%。
