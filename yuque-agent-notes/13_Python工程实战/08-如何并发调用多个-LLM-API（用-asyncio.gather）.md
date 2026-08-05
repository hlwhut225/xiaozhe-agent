---
title: "8. 如何并发调用多个 LLM API？（用 asyncio.gather）"
source: https://www.yuque.com/u28128023/mk3u4m/xtpzvblfkdtg6t0r
exported_at: 2026-07-27
---

# 8. 如何并发调用多个 LLM API？（用 asyncio.gather）

## 知识点讲解

### 1. 核心概念

asyncio.gather() 是 Agent 并发调用的核心——把多个协程打包，同时发出，全部完成后按输入顺序返回结果。

Agent 调用 LLM 的延迟通常在 1-5 秒。如果有 5 个子任务各需要调一次 LLM，串行要 5-25 秒，并发只需最慢那个——通常 5 秒出头。这个差距在复杂任务里直接决定用户体验。

### 2. 技术细节

asyncio.gather 有两种常用模式：

**默认模式**：任何一个任务失败，立刻抛异常，其他任务虽然继续运行但结果被丢弃。

return\_exceptions=True：所有任务都跑完，成功的返回结果，失败的返回异常对象。适合 Agent 场景——部分工具失败不应该让整步崩掉。

**并发限流**：用 asyncio.Semaphore 控制最大并发数，避免触发 rate limit：

### 3. 对比与拓展

gather vs as\_completed：gather 等所有完成按顺序返回；asyncio.as\_completed() 谁先完成先给谁，适合"第一个结果出来就处理"的场景，比如竞速策略（同时发多个模型，谁快用谁）。

## 代码示例

**多模型竞速：谁快用谁**

**批量 embedding：限流 + 并发**

**ReWOO 风格并行执行**

## 面试怎么答

> 并发调用多个 LLM API 的标准做法就是 asyncio.gather——把多个 async 调用打包，同时发出，返回按输入顺序排列的结果列表。耗时由最慢的那个决定，而不是所有耗时之和。
> 
> 生产环境里有两个必须加的东西：一是 return\_exceptions=True，部分工具失败不应该把整步崩掉，要能区分哪个成功哪个失败；二是 asyncio.Semaphore 限流，同时打出太多请求容易触发 rate limit，一般我习惯按 API 的 RPM 上限反推最大并发数。
> 
> 如果有"谁快用谁"的需求（比如同时发多个模型做竞速），用 asyncio.as\_completed 更合适，第一个完成就处理并取消其他任务。

## 高频追问 & 加分点

-   **Q1：gather 里的任务数量有上限吗？** 没有硬上限，但实践中要控制。几十个并发没问题；几千个同时打 API 会导致连接耗尽或触发对端限流。正确做法是 Semaphore 限制最大并发，或者分批 gather（把任务分成 batch\_size 一组，每组 gather 完再下一组）。

-   **Q2：如果要获取第一个完成的结果并取消其他，怎么做？** 用 asyncio.wait(tasks, return\_when=asyncio.FIRST\_COMPLETED)，或者像示例里用 as\_completed 手动 cancel。取消后要 await 那些被取消的 task 确保它们确实停了，不然后台还在跑。加分点：task.cancel() 只是发送取消信号，协程里下一个 await 才会实际抛 CancelledError，没有 await 点的代码取消不掉。

-   **Q3：OpenAI 和 Anthropic 的 SDK 支持 asyncio 吗？** 两者都有异步版本。OpenAI 用 from openai import AsyncOpenAI；Anthropic 用 from anthropic import AsyncAnthropic。方法签名和同步版本基本相同，加个 await 就行。第三方工具库要注意看文档——有些只有同步版本，需要用 asyncio.to\_thread() 包装才能在 async 上下文里用。

-   **Q4：并发 LLM 调用的成本控制怎么做？** 三层：①Semaphore 限并发数，防止瞬时流量打爆；②请求级别加 max\_tokens 上限，防止单次超额；③会话级别记录累计消耗，超阈值拒绝新请求。生产里还会加缓存（相同 prompt 命中缓存直接返回），Anthropic 的 Prompt Caching 可以在 SDK 层直接启用，高频重复 system prompt 省 90% input token。
