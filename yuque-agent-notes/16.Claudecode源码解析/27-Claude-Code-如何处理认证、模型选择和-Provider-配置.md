---
title: "27. Claude Code 如何处理认证、模型选择和 Provider 配置？"
source: https://www.yuque.com/u28128023/mk3u4m/gqo1k5kbh56o27p8
exported_at: 2026-07-27
---

# 27. Claude Code 如何处理认证、模型选择和 Provider 配置？

Claude Code 如何处理认证、模型选择和 Provider 配置？

Agent 接入模型时，Demo 往往只有三行配置：一个 API Key、一个模型名、一个请求地址。

可一旦产品要同时支持账号登录、环境变量、CI 密钥、企业网关、Bedrock、Vertex、Foundry 和自定义 Provider，三行代码会迅速变成一团优先级判断。更危险的是，认证来源和模型选择彼此有关：OAuth 能用的能力不一定适用于第三方云；同一个 sonnet 别名，在不同 Provider 下可能要映射为不同模型 ID。

如果解析顺序不稳定，同一台机器可能因为钥匙串里还留着旧登录，就覆盖了 CI 明确传入的 Key；用户切到 Bedrock，程序却继续附加第一方 OAuth Header；配置里允许的模型被命令行绕过，安全边界也会失效。

Claude Code 源码给出的短答案是：**先解析 Provider，再按显式优先级选择认证来源和模型设置，最后把用户友好的别名归一化成 Provider 真正接受的模型 ID。**

这不是三个互不相干的工具函数，而是一条配置决策链。

## Provider 必须先于认证与模型被确定

Provider 决定请求发往哪套后端，也决定凭证来自哪套基础设施。源码把内置 Provider 归纳为 firstParty、bedrock、vertex 和 foundry，环境变量优先于结构化 Provider 配置，最后才回退到第一方：

为什么 Provider 要先解析？

因为后面的每一个默认值都依赖它。第一方可以使用 OAuth 或 API Key；Bedrock 依赖 AWS 凭证链；Vertex 使用 Google 身份；Foundry 又有自己的部署和认证语义。模型 ID 同样不同，第三方云的模型上线时间还可能落后于第一方。

一个可靠的请求配置流程应该是：

不要先读取所有可能的凭证，再看哪个“恰好存在”。那会让机器的历史状态参与决策。Provider 是认证策略和模型命名空间的总开关。

## 认证来源需要优先级，也需要互斥规则

Claude Code 不只是查找“有没有 Token”，还会返回 Token 的来源。恢复源码中可以看到 ANTHROPIC\_AUTH\_TOKEN、OAuth 环境变量、文件描述符、apiKeyHelper、安全存储等不同路径。

记录来源有什么用？

第一，错误提示才准确。环境变量失效时应该提示检查变量，账号登录过期时应该刷新 OAuth，而不是统一显示“未登录”。

第二，可以阻止不该发生的回退。源码在发现 apiKeyHelper 已配置但缓存暂时为空时，会保留 source='apiKeyHelper'，而不是继续跌落到钥匙串。否则短暂的加载时序会偷偷切换账号。

第三，日志可以记录“来源类型”，而不记录秘密本身。可观测性需要知道失败集中在哪条认证路径，但永远不需要把 Token 写入日志。

互斥同样重要。第三方 Provider、生效中的外部 API Key 或外部 Auth Token，会关闭第一方 OAuth 路径。不是哪个凭证先读到就用哪个，而是先决定哪些认证体系在当前模式下合法。

## \--bare 展示了什么叫密封的认证环境

普通交互环境为了方便，可以读取安全存储、账号登录和用户配置。但脚本或容器经常需要可重复性：这次运行只能使用调用者明确提供的秘密，不能碰宿主机钥匙串。

源码对 Bare 模式的认证边界很明确：第一方只允许环境中的 API Key，或者由显式 \--settings 提供的 apiKeyHelper；不读 OAuth、钥匙串和普通配置文件。第三方 Provider 继续走各自的云凭证链。

这类模式的价值不只是快，而是“密封”。如果 CI 没传 Key，它应当稳定失败，而不是因为某位开发者本地登录过就偶然成功。

开发自己的 Agent 时，可以把认证上下文显式建模：
