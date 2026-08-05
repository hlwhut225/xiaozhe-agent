---
title: "5. ReAct Agent 是如何工作的？"
source: https://www.yuque.com/u28128023/mk3u4m/wzy2t681cmke20r2
exported_at: 2026-07-27
---

# 5. ReAct Agent 是如何工作的？

## 知识点讲解

### 1. 核心概念

ReAct 是 2022 年 Princeton 大学提出的 Agent 范式，全称 Reasoning + Acting。论文的核心发现是：让 LLM 在每次行动前先"想一想"，然后再执行，效果远好于直接输出答案。

这个思路现在看来很自然，但在当时是个重要洞察：**把推理过程和行动过程交织在一起，让 LLM 边想边做**。

ReAct 的执行单元是三元组：**Thought → Action → Observation**，循环直到得出答案。

-   **Thought**：LLM 的推理过程，用自然语言输出，解释"我现在为什么要做这件事"

-   **Action**：调用某个工具，或者输出最终答案

-   **Observation**：工具的执行结果，反馈给 LLM 作为下一步的输入

这三个步骤循环往复，形成一个自适应的推理-行动链条。每次 Observation 都可能改变后续的 Thought，这就是 ReAct 相比静态规划的优势——**基于观察动态调整**。

### 2. 技术细节

#### 2.1 Prompt 设计是 ReAct 的核心

ReAct 不是一个复杂的算法，它的本质是**通过 Prompt 引导 LLM 按照固定格式输出**，然后用代码解析这个格式来驱动工具调用。Prompt 里要说三件事：① 输出格式（Thought / Action / Observation 三件套 + Final Answer 终止信号）；② 可用工具清单和描述；③ 至少一个 few-shot 示例让 LLM 学会节奏。具体 Prompt 模板见下方"代码示例"。

#### 2.2 ReAct Agent 的实现骨架

实现层面有四个关键点：① **工具抽象**——每个工具是 name + description + 执行函数 三元组，描述拼进 system prompt 给 LLM 看；② **主循环**——LLM 出一段文本，正则提取 Action:，找到工具名和参数，执行后把结果包成 Observation: 注入回对话历史；③ **终止条件**——看到 Final Answer: 立刻返回；④ **格式异常兜底**——LLM 没按格式输出时，给它一句"请按 Action: tool\_name(参数) 格式"的提示，让它重试一轮。完整代码见下方"代码示例"。

#### 2.3 工具设计的关键原则

ReAct 的效果很大程度取决于工具描述写得好不好——LLM 就是靠读这段描述来决定用哪个工具。

| 原则 | 好的示例 | 差的示例 |
| --- | --- | --- |
| 名称语义清晰 | web_search | tool1 |
| 描述说明输入格式 | "接受搜索关键词字符串，返回相关网页摘要" | "搜索工具" |
| 描述说明适用场景 | "适合查询实时信息、新闻、产品价格" | 无 |
| 描述说明局限性 | "不能访问付费内容，结果可能有延迟" | 无 |

### 3. 对比与拓展

ReAct 之后衍生出了几个改进方向：

-   **Reflexion**：在 ReAct 的基础上增加"反思"步骤——任务失败后，让 LLM 总结失败原因并更新策略，下次做得更好

-   **Self-Ask**：把复杂问题显式分解为一系列子问题，每个子问题单独 ReAct 一次

-   **Tree-of-Thought**：不是线性地 Thought → Action，而是每个 Thought 点生成多个分支，搜索最优路径

ReAct 本质上是这些进阶方法的基础，理解了 ReAct 就理解了 80% 的 Agent 执行逻辑。

## 代码示例

**① ReAct 的核心 Prompt 模板（灵魂部分）**

**② ReAct Agent 的执行循环骨架**

关键点：解析 Action 的正则、Observation 注入回对话历史、最大迭代数硬上限——这三块决定了 ReAct 的稳定性。

## 面试怎么答

> ReAct 的工作方式是让 LLM 把推理和行动交织在一起：每次行动之前先输出一段 Thought 解释为什么要这么做，然后 Action 调用工具，工具返回 Observation，再继续下一轮 Thought。这个 Thought/Action/Observation 循环持续到得出最终答案。
> 
> 和纯粹的 Chain-of-Thought 相比，ReAct 的关键优势是能访问外部信息——CoT 只是在脑子里推理，处理不了"查实时数据"、"算数学题"这类需要工具的任务。ReAct 引入工具调用，把推理能力和行动能力结合了。
> 
> 实现 ReAct 的核心是 Prompt 设计：用一段 system prompt 加上 few-shot 示例，让 LLM 学会按 Thought/Action/Observation 格式输出，然后代码解析这个格式，识别要调用哪个工具，执行后把结果作为 Observation 反馈。整个框架其实很轻量，LangChain 的 ReAct agent 本质上就是这么工作的。

## 高频追问 & 加分点

-   **Q1：ReAct 的 Thought 有什么作用？能不能去掉？** Thought 不只是"可解释性"，它实际上能提升 LLM 的推理质量——让模型在行动前先显式思考，相当于 Chain-of-Thought 的效果。实验也证明有 Thought 的版本比没有的表现更好。当然可以去掉，但通常会降低准确率，尤其是复杂任务。

-   **Q2：工具数量多了会影响 ReAct 的表现吗？** 会。工具太多（30+ 个）时，LLM 选错工具的概率上升，因为工具描述占用了大量 context，还容易相互混淆。实践里超过 15 个工具就要考虑分组或按任务动态选工具，而不是把所有工具都塞进 prompt。

-   **Q3：ReAct 什么情况下会陷入循环？** 两种常见情况：工具的 Observation 没有提供新信息（比如搜索返回"未找到相关内容"），LLM 可能反复调用同一工具；或者 LLM 对完成条件判断错误，已经有答案了却认为还没完成。解决方法是在 Observation 中加入"你是否已有足够信息"的提示，同时设置最大步数硬限制。

-   **Q4：如何让 ReAct 的结果更稳定（每次输出一致）？** 三个方向：降低 temperature（到 0 或 0.1）减少随机性；在 few-shot 示例里给出清晰的格式规范；在工具描述里明确适用场景让工具选择更确定。完全消除随机性几乎不可能，但能大幅提高稳定性。

-   **Q5：ReAct 和 Function Calling 有什么区别？** 本质思路相同，但实现方式不同。ReAct 是 prompt-based，LLM 把 Action 写在自然语言里，代码用正则解析；Function Calling 是 OpenAI 等供应商内置的机制，LLM 直接输出结构化的 JSON，更可靠也不容易解析失败。现代 Agent 框架基本都转向 Function Calling，ReAct 更多是理解原理的切入点。
