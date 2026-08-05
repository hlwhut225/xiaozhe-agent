---
title: "17. 如何用 Python 实现工具调用（Function Calling）？"
source: https://www.yuque.com/u28128023/mk3u4m/bkl41cy93im4sog1
exported_at: 2026-07-27
---

# 17. 如何用 Python 实现工具调用（Function Calling）？

## 知识点讲解

### 1. 核心概念

Function Calling（工具调用）是让 LLM 主动选择调用预定义函数的机制。和在 prompt 里描述工具再手动解析文本相比，它返回的是**结构化的 JSON 参数**，不需要正则解析，可靠性高出一个量级。

完整流程：

### 2. 技术细节

**工具 Schema 结构**（Anthropic 格式）：

关键点：description 写得越清晰，LLM 选择工具越准确。工具描述就是 LLM 的"说明书"，含混不清会导致工具选错。

**工具调用 vs 直接回答**：当 stop\_reason == "end\_turn" 是直接回答；stop\_reason == "tool\_use" 是要调用工具。

### 3. 对比与拓展

LLM 什么时候会选错工具？工具描述重叠、参数说明不清、工具太多（超过 20 个开始降准）。工程上的应对：功能相似的工具合并、描述里加明确的使用条件（"当需要 X 时使用，当需要 Y 时不要用"）、工具数量多时用分层路由（先选类别再选具体工具）。

## 代码示例

**完整 Function Calling 循环（Anthropic）**

**用 Python 类型提示自动生成 Schema**

## 面试怎么答

> Function Calling 让 LLM 返回结构化的工具调用——工具名 + JSON 参数，Agent 直接执行，不需要解析文本。和文本解析式相比，可靠性提升一个量级：JSON 参数不会有格式错误，工具名不会拼错。
> 
> 实现流程：定义工具 Schema（含名字、描述、参数类型）→ 随消息发给 LLM → 检查 stop\_reason：end\_turn 是直接回答、tool\_use 是要调工具 → 执行工具 → 把结果作为 tool\_result 发回 → LLM 继续推理。这个循环可以多轮。
> 
> 工具描述写好很关键。LLM 靠描述选工具，描述含混会导致工具选错。我习惯在 description 里写"什么情况下用"和"什么情况下不用"，比只写功能要准得多。

## 高频追问 & 加分点

-   **Q1：工具太多 LLM 选不准怎么办？** 超过 15-20 个工具，准确率开始下降。解决方案：①减少工具数量，合并功能相似的；②分层路由——先用小 LLM 选工具类别，再在类别里选具体工具；③动态工具列表——根据对话上下文只传当前可能用到的工具子集。加分点：RAG 工具检索也是一种方案，把工具描述做成 embedding，用查询相似度动态选相关工具。

-   **Q2：如何验证 LLM 传来的工具参数？** 不能信任 LLM 生成的参数，必须校验。用 pydantic BaseModel 定义参数模型，Model(\*\*tool\_input) 直接校验类型和约束。失败抛 ValidationError 就把错误信息作为 tool\_result 返回，让 LLM 重新生成正确参数。这是防止工具被乱用的基础防线。

-   **Q3：工具调用结果多大合适？** context window 是有限资源，工具结果太长会把有用的历史挤掉。一般原则：结果 < 1000 tokens 直接返回；超过就截断或摘要（取前 N 条、提取关键字段）。返回 JSON 时压缩格式（去掉多余空格、只保留必要字段）也能省不少 token。

-   **Q4：OpenAI 和 Anthropic 的 Function Calling 格式有什么差异？** 核心概念一样，schema 格式有细微差异。OpenAI 的工具定义有多一层 "type": "function" 包装；响应字段是 tool\_calls\[\].function.arguments（字符串需要 json.loads）；Anthropic 响应是 content\[\].input（直接是 dict，不需要 json.loads）。LiteLLM 库提供统一封装，一套代码调多个 provider。
