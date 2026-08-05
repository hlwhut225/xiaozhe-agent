---
title: "14. 什么是 MCP（Model Context Protocol）？"
source: https://www.yuque.com/u28128023/mk3u4m/hsytn4rsz0559a2t
exported_at: 2026-07-27
---

# 14. 什么是 MCP（Model Context Protocol）？

## 知识点讲解

### 1. 核心概念

MCP（Model Context Protocol）是 Anthropic 于 2024 年底发布的开放标准协议，目标是解决 AI 工具集成的碎片化问题。

**碎片化是什么意思**：现在每一个 LLM 都有自己的工具接口格式（OpenAI 的 Function Calling、Anthropic 的 Tool Use），每一个外部服务（GitHub、Slack、数据库）都要为每个 LLM 单独写适配代码。N 个 LLM × M 个服务 = N×M 份重复工作。

**MCP 的解法**：服务提供者实现一次 MCP Server，任何实现了 MCP Client 的 LLM 应用都能直接接入——N 个 LLM + M 个服务，只需要 N+M 份工作，而不是 N×M。

MCP 本质上是一个基于 JSON-RPC 2.0 的通信协议，定义了客户端（LLM 应用）和服务端（工具提供者）之间的标准消息格式。

### 2. 技术细节

#### 2.1 MCP 的三种能力类型

MCP Server 可以暴露三种类型的能力：

**Tools**（工具）：可以执行操作的函数，有副作用——执行代码、查询数据库、发送消息。这是 Agent 最常用的部分，等同于 Function Calling 里的工具。

**Resources**（资源）：只读的数据访问——读取文件、查看日志、获取文档。不是函数调用，是数据暴露。

**Prompts**（提示词模板）：预设的 prompt 片段，可以被 LLM 应用按需加载。

#### 2.2 协议通信格式

MCP 用 JSON-RPC 2.0 格式通信。几个核心方法：

传输层支持多种方式：**stdio**（本地进程通过标准输入输出通信，适合本地工具）；**HTTP+SSE**（通过网络通信，适合远程服务）。

#### 2.3 MCP 的生态现状

截至 2025 年初，主流 AI 编辑器（Cursor、Continue）和 Claude Desktop 都支持 MCP 协议。已有上百个开源 MCP Server 可以直接使用（GitHub、Slack、PostgreSQL、浏览器控制等）。

从工程师角度看：如果你在开发 Agent，接入现有 MCP Server 比自己写工具集成快很多；如果你在做内部服务，把它包装成 MCP Server 能让它同时被多个 AI 应用使用。

## 代码示例

**实现一个 MCP Server（天气查询示例）**

**MCP Client 调用（集成到 Agent 里）**

**在 Claude API 里集成 MCP 工具（概念示意）**

## 面试怎么答

> MCP 是 Anthropic 提出的开放工具协议，核心价值是解决 AI 工具集成的碎片化问题。没有 MCP 之前，每个外部服务要为每个 LLM 分别写适配代码，N 个 LLM × M 个服务 = N×M 份工作；有了 MCP，服务实现一次 MCP Server，所有支持 MCP 的 LLM 应用都能接入，变成 N+M 份工作。
> 
> 技术上，MCP 是基于 JSON-RPC 2.0 的通信协议，定义了三种能力类型：Tools（工具，有副作用的函数调用）、Resources（只读数据访问）、Prompts（预设 prompt 模板）。传输层支持 stdio（本地进程）和 HTTP+SSE（远程服务）。
> 
> 实际价值上，MCP 的生态已经在快速增长——GitHub、Slack、PostgreSQL、浏览器控制等主流服务都有开源 MCP Server。对于 Agent 开发，接入现有 MCP Server 比自己写工具快很多；对内部服务，包装成 MCP Server 能让它被多个 AI 应用复用。

## 高频追问 & 加分点

-   **Q1：MCP 和 OpenAI 的 Plugin 有什么区别？** OpenAI Plugins（已下线）只能和 GPT 配合，是 OpenAI 专有的；MCP 是开放协议，设计上与模型无关，任何 LLM 应用都可以实现 MCP Client。另外 MCP 不只有 Tools，还有 Resources 和 Prompts，能力范围更广。

-   **Q2：自己的工具要改成 MCP 格式吗？** 不一定。如果只是自用或者工具集固定，不需要——直接用 Function Calling 更简单。如果工具需要被多个 AI 应用共享、或者希望接入 MCP 生态（Claude Desktop、Cursor 等），包装成 MCP Server 才有意义。改造成本不高，主要是套一层 @app.list\_tools() 和 @app.call\_tool() 的装饰器。

-   **Q3：MCP Server 的安全性怎么保证？** MCP 协议层面没有强制的认证机制（这是设计上的权衡，保持协议简单）。安全需要在实现层处理：本地 stdio 通信相对安全（只有本机进程能连）；HTTP 传输需要自己加认证（API Key、OAuth）；工具执行的权限检查还是得在 Server 侧实现，MCP 不帮你做。

-   **Q4：MCP 的 Resources 和 Tools 怎么选？** 简单判断：有副作用的操作（写数据、发消息、执行命令）用 Tools；纯读取的内容（文档、文件、日志）用 Resources。Resources 的语义是"LLM 可以读取的上下文数据"，不是函数调用，更接近 RAG 里的"文档"概念。

-   **Q5：本地 MCP Server（stdio）和远程 MCP Server（HTTP）怎么选？** 本地 stdio 适合开发环境和本地工具（文件系统、本地数据库），延迟低，不需要网络；远程 HTTP+SSE 适合共享服务、云端部署，多个客户端可以同时连接。生产环境的企业内部服务通常用 HTTP 方式，开发者自用工具用 stdio 更简单。
