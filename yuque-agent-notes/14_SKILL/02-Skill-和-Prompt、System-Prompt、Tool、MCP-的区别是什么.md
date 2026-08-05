---
title: "2. Skill 和 Prompt、System Prompt、Tool、MCP 的区别是什么？"
source: https://www.yuque.com/u28128023/mk3u4m/qxug38hm5rglbv8y
exported_at: 2026-07-27
---

# 2. Skill 和 Prompt、System Prompt、Tool、MCP 的区别是什么？

## 知识点讲解

### 1. 核心概念

Skill、Prompt、System Prompt、Tool、MCP 都会影响 Agent 行为，但它们解决的问题层级不同。面试里最容易混淆的是：Prompt 是一次性的语言指令，System Prompt 和项目级自定义指令是长期规则，Tool 是可执行能力，MCP Connector 是外部工具与资源接入方式，Skill 是任务方法论和资源包。

可以用一句话区分：Prompt 告诉模型“这次怎么回答”，System Prompt / Project Instructions 告诉模型“长期遵守什么角色和边界”，Tool 给模型“能做什么动作”，MCP Connector 规范“外部能力如何接进来”，Skill 则告诉模型“遇到某类任务应该按什么流程做”。

### 2. 技术细节

#### 2.1 五者的边界

| 概念 | 主要作用 | 生命周期 | 典型内容 |
| --- | --- | --- | --- |
| Prompt | 单次任务指令 | 请求级 | 用户目标、输出格式、临时约束 |
| System Prompt | 全局行为约束 | 会话或产品级 | 角色、安全策略、优先级规则 |
| Project / Custom Instructions | 项目或用户偏好 | 项目、工作区或账号级 | 编码规范、写作偏好、固定上下文 |
| Tool | 外部动作能力 | 系统注册级 | 搜索、文件读写、数据库查询 |
| MCP Connector | 能力接入与连接 | 连接与运行时级 | 工具、资源、提示模板、外部系统接口 |
| Skill | 任务能力封装 | 可安装、可复用 | 工作流、参考资料、脚本、模板 |

Prompt 和 Skill 都是“用自然语言影响 Agent”，但 Prompt 偏临时，Skill 偏沉淀。Project / Custom Instructions 更像长期偏好或项目背景，通常会频繁进入上下文；Skill 则是按任务触发的能力模块。Tool 和 Skill 都能扩展能力，但 Tool 关注执行动作，Skill 关注如何组织动作。MCP Connector 可以承载工具和资源，而 Skill 可以指导 Agent 如何使用这些资源。

#### 2.2 为什么需要同时存在

只靠 Prompt，复杂任务的经验不可复用；只靠 Tool，Agent 只知道有按钮，不知道什么时候按、按完如何验收；只靠 System Prompt，规则会过重；只靠 MCP，解决的是连接问题，不解决任务方法论问题。

Skill 的位置很微妙：它可以调用工具，但不是工具；它可以包含提示词，但不是一次性 prompt；它可以引用资源，但不等同于知识库；它可以和 MCP Connector 配合，但不负责完成外部系统连接。它的核心是“面向任务的执行策略”。

在企业系统里还要区分 Skill 和传统插件。插件或 Connector 通常要声明外部权限、账号授权和数据访问范围；Skill 则更强调任务规则、资源组织和可审计指令。一个 Skill 可以要求只使用某些工具，例如通过 allowed-tools 表达预期边界，但最终是否强制执行取决于平台治理能力。

## 面试怎么答

> 我会按层级区分。Prompt 是请求级指令，System Prompt 是全局行为约束，Project / Custom Instructions 是项目或用户长期偏好，Tool 是外部可执行动作，MCP Connector 是工具和资源的接入方式，Skill 是围绕一类任务沉淀的执行方法、规则和资源包。
> 
> 举个例子，用户让 Agent 做一份竞品分析。Prompt 是这次分析的具体要求；System Prompt 规定 Agent 要诚实、安全、遵守权限；Tool 可能是搜索、读文件、生成表格；MCP 负责把这些工具标准化接入；Skill 则告诉 Agent 竞品分析应该先确定维度、再收集证据、最后输出对比结论。
> 
> 所以 Skill 的价值不在于“多一个能力入口”，而在于让 Agent 知道如何把已有能力组织成稳定流程。

## 高频追问 & 加分点

-   **Q1：Skill 能不能替代 Tool？** 不能。Skill 可以指导调用工具，但真正的外部动作仍然需要 Tool 或 MCP server 来执行。

-   **Q2：Skill 和 RAG 知识库有什么区别？** RAG 主要提供知识，Skill 主要提供流程和规范。Skill 可以引用知识文件，但它不只是检索材料。

-   **Q3：Skill 和 System Prompt 冲突时怎么办？** 通常 System Prompt 优先级更高。Skill 应该在全局安全和产品策略边界内工作，不能绕过系统级约束。

-   **Q4：Skill 和 MCP Connector 最大区别是什么？** MCP Connector 解决外部系统怎么接入，Skill 解决任务应该怎么执行。前者偏接口和授权，后者偏流程和质量标准。
