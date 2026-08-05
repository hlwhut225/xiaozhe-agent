---
title: "5. Function Calling 的设计原则是什么？"
source: https://www.yuque.com/u28128023/mk3u4m/tkyq1ptnrlqidosi
exported_at: 2026-07-27
---

# 5. Function Calling 的设计原则是什么？

## 知识点讲解

### 1. 核心概念

Function Calling（函数调用）是 LLM 的一种能力：模型不直接生成文本答案，而是生成一个"我要调用这个函数，参数是这些"的结构化指令，由 Agent 框架解析并执行，再把结果返回给模型继续推理。

这是 Agent 能够操作外部世界的根本机制。没有 Function Calling，LLM 只能生成文本；有了它，LLM 可以查数据库、调 API、执行代码。

两大主流实现的格式略有差异：

**OpenAI Function Calling**：工具包在 tools 字段里，格式是 {"type": "function", "function": {...}}，模型触发时返回 tool\_calls 字段。

**Anthropic Tool Use**：工具直接在 tools 数组里，格式稍微简洁，模型触发时 stop\_reason 是 "tool\_use"，在 content 里返回 tool\_use block。

原理一样，就是 JSON 字段名不同，接入时注意格式即可。

### 2. 技术细节

#### 2.1 Function Calling 的四个设计原则

**① 最小化参数**：一个函数的参数控制在 3-7 个。参数越多，模型填错的概率越高，调用结果越不可预测。把可选的低频参数做成默认值，不要暴露给模型。

**② 单一职责**：一个工具只做一件事。get\_user\_info\_and\_send\_email 这种合并工具会让模型困惑。拆成 get\_user\_info 和 send\_email 两个工具，模型更容易知道什么时候该用哪个。

**③ 返回值结构固定**：工具的返回值格式要稳定，不能一次返回 {"result": "..."} 另一次返回字符串。模型需要理解并处理工具返回值，格式不稳定会让模型迷惑。

**④ 失败时给有意义的错误信息**：不要只返回 {"error": true}，要返回 {"error": "用户 ID 不存在", "suggestion": "请检查用户 ID 是否正确"}。模型需要这些信息来决定下一步怎么做——是重试、换参数还是告知用户。

#### 2.2 调用流程的五个阶段

这个循环可以持续多轮，直到 stop\_reason 变成 "end\_turn" 或 "stop\_sequence"。

#### 2.3 并行工具调用

当用户问"帮我查一下北京和上海明天的天气"，模型可以在同一轮生成两个工具调用，Agent 并行执行，效率是串行的两倍。OpenAI 和 Anthropic 都支持这种模式，实现时需要收集所有 tool\_calls 的结果，一起放回 messages。

## 代码示例

**Anthropic Tool Use 完整调用循环**

**OpenAI Function Calling 对比写法**

**统一封装层（屏蔽两家格式差异）**

## 面试怎么答

> Function Calling 的核心是让 LLM 生成结构化的"调用指令"，而不是直接输出答案——模型说"我要调用 get\_weather，参数是 city=北京"，Agent 框架执行后把结果返回给模型，模型继续推理。
> 
> 设计原则上，最重要的四点：参数最小化（控制在 3-7 个，减少模型填错的概率）；单一职责（一个工具只做一件事，不要合并功能）；返回值格式固定（模型要读取并理解返回值，格式不稳定会让后续推理出错）；失败时返回有意义的错误（告诉模型"用户 ID 不存在"，而不只是"error: true"）。
> 
> OpenAI 和 Anthropic 的实现格式略有差异：OpenAI 在 tools 里包一层 {"type": "function", ...}，返回结果放在 role: tool 消息里；Anthropic 直接用 tools 数组，结果通过 tool\_result block 回传。原理完全一样，接入时注意格式适配。

## 高频追问 & 加分点

-   **Q1：模型选错了工具或者参数填错了怎么办？** 两个层面处理：Schema 层用 JSON Schema 约束参数格式（enum、type、required），模型生成不合法参数时直接校验拦截；执行层捕获异常，把错误信息格式化后作为 tool\_result 返回给模型，让模型决定是重试还是换策略。

-   **Q2：并行工具调用怎么实现？** 不需要额外实现——当模型在一轮返回多个 tool\_use block（Anthropic）或多个 tool\_calls（OpenAI）时，就是并行调用信号。Agent 侧用 asyncio.gather 或线程池并行执行这些工具，然后把所有结果统一放回 messages。注意：并行工具之间不能有数据依赖（A 的结果是 B 的输入时，只能串行）。

-   **Q3：工具结果太长放进 messages 会超 token 吗？** 会。工具返回值要控制长度，特别是数据库查询结果或搜索摘要。实践方案：返回值截断（超过 N 字符自动截断）；只返回结构化摘要而不是完整原始数据；对长结果做二次压缩（让 LLM 先总结再传回）。

-   **Q4：tool\_choice 参数怎么用？** OpenAI 和 Anthropic 都有这个参数，控制模型的工具使用行为。auto（默认）：模型自己决定；required：模型必须调用至少一个工具；指定工具名：强制调用某个特定工具。在某些场景里强制调用（比如数据提取任务）比依赖模型自主判断更可靠。

-   **Q5：什么情况下不用 Function Calling，直接解析 JSON 输出？** 当工具调用是固定的、可预测的（比如始终需要提取特定字段），直接让模型输出 JSON 然后解析有时候更简单。Function Calling 的价值在于让模型自己决定调不调用、调哪个——当工具选择是确定的，多一层 Function Calling 只是增加复杂度。
