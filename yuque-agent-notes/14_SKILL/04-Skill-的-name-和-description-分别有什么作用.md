---
title: "4. Skill 的 name 和 description 分别有什么作用？"
source: https://www.yuque.com/u28128023/mk3u4m/qqvtnlu3q4fuw4k9
exported_at: 2026-07-27
---

# 4. Skill 的 name 和 description 分别有什么作用？

## 知识点讲解

![](https://cdn.nlark.com/yuque/0/2026/png/28539630/1778421663422-db6f50a2-8e41-4735-bc09-dcb9e1121288.png)

### 1. 核心概念

Skill 的 name 和 description 是最重要的元数据。name 解决身份识别问题，description 解决适用场景判断问题。一个给人看，一个也给机器看；一个偏稳定标识，一个偏触发语义。

很多人会把 description 写成宣传语，比如“一个强大的文档处理 Skill”。这对 Agent 几乎没有帮助。好的 description 应该明确说明：它适合哪些任务、输入是什么、产出是什么、什么时候应该使用。

在主流 SKILL.md 规范里，name 和 description 通常都是必填 frontmatter 字段。平台发现 Skill 时，往往先读这两个字段，而不是直接把完整说明和资源文件放进上下文。

### 2. 技术细节

#### 2.1 name：稳定、短、可引用

name 通常应该短、唯一、稳定。它可能被日志、配置、权限系统、安装清单和用户显式引用使用。如果经常改名，会影响追踪和依赖关系。

主流规范通常要求 name 使用小写字母、数字和连字符，例如 documents、spreadsheets、code-review。不建议用中文、空格或标点，因为它可能要匹配目录名、跨平台同步、审计日志和安装清单。它的重点不是自然语言解释，而是作为能力模块的身份标识。

#### 2.2 description：触发和选择的核心信号

description 更像一个检索摘要。系统在决定是否加载某个 Skill 时，往往不会先读取完整 SKILL.md，而是先看 name、description 等轻量信息。因此 description 的质量会直接影响召回率和精确率。

一个有效 description 通常包括三类信息：

**任务动词**：创建、编辑、审查、评估、转换、生成。 **对象范围**：PPTX、合同、代码评审、品牌图、表格模型。 **使用边界**：适合什么，不适合什么，是否需要渲染校验。

在多平台环境里，description 还承担“surface 差异”的缓冲作用。Claude Skills、OpenAI/Codex Skills、ChatGPT Skills、API Skills 的触发器和可用工具可能不同，但清晰的 description 能帮助不同 runtime 更稳定地做候选召回。

#### 2.3 两者如何配合

name 不需要写成长句，description 不能只重复 name。比如 name: presentations 只是身份；description 应该说明“用于创建、修改、渲染并验证演示文稿，适合需要 PPTX 或 slide deck 的任务”。这样 Agent 才能在“做一份融资路演 PPT”时正确匹配。

同时，name 不是权限声明，description 也不是安全边界。是否允许读文件、联网、调用脚本，应该由平台权限、allowed-tools、安装策略和组织治理共同控制，不能只靠一句描述约束。

## 面试怎么答

> Skill 的 name 是稳定标识，主要用于安装、引用、日志和权限管理；description 是语义触发信息，主要用于判断这个 Skill 是否适合当前任务。
> 
> name 要短、稳定、唯一，主流规范通常要求小写字母、数字和连字符，不建议用中文；description 要具体，写清楚任务类型、对象范围、典型产出和边界。因为 Agent 或平台通常会先基于元数据做候选召回，不会一开始就读完整 Skill 内容，所以 description 写得模糊会直接导致该触发时不触发，或者不该触发时乱触发。
> 
> 一个好的 Skill 元数据，本质上是在帮助 Agent 做能力路由。

## 高频追问 & 加分点

-   **Q1：description 越长越好吗？** 不一定。太短不够判别，太长会引入噪声。重点是覆盖关键任务词和边界条件。

-   **Q2：name 能不能使用中文？** 不建议。主流规范倾向于小写英文、数字和连字符，便于目录、日志、路径、配置、权限和跨团队协作。

-   **Q3：description 应该面向用户还是面向 Agent？** 主要面向 Agent 和平台的匹配逻辑，同时也要让维护者读得懂。它不是营销文案。

-   **Q4：description 能不能替代 allowed-tools？** 不能。description 是触发语义，allowed-tools 或平台权限才是工具使用边界的一部分。
