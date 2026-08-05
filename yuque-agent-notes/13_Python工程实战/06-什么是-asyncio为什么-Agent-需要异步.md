---
title: "6. 什么是 asyncio？为什么 Agent 需要异步？"
source: https://www.yuque.com/u28128023/mk3u4m/oyl0ugekz9bi4hc5
exported_at: 2026-07-27
---

# 6. 什么是 asyncio？为什么 Agent 需要异步？

## 知识点讲解

### 1. 核心概念

asyncio 是 Python 的异步 I/O 库，核心是**事件循环（Event Loop）**。事件循环在单线程里轮流调度多个协程，谁在等 I/O，就切换去跑别人。

这和多线程的区别在于：**切换时机是程序主动控制的**（遇到 await 交出控制权），不是操作系统抢占的。所以没有线程切换的上下文开销，也不受 GIL 限制。

**协程（Coroutine）**：用 async def 定义的函数。调用它不会立即执行，而是返回一个协程对象，等被 await 或包装成 Task 后才开始跑。

**Agent 为什么需要异步？**

Agent 的执行瓶颈几乎都是 I/O——调 LLM API（1-10s）、查向量数据库（100ms）、搜索网络（500ms）。串行执行这些操作，总耗时是它们的简单相加；并发执行，总耗时接近最慢的那个。

同一批 3 个工具调用：

-   串行：2s + 1s + 1.5s = 4.5s

-   asyncio 并发：max(2s, 1s, 1.5s) = 2s

### 2. 技术细节

asyncio 的核心原语：

| 原语 | 用途 |
| --- | --- |
| async def | 定义协程函数 |
| await | 挂起当前协程，等待结果 |
| asyncio.create_task() | 把协程包装成 Task，立即开始调度 |
| asyncio.gather() | 并发运行多个协程，等全部完成 |
| asyncio.wait_for() | 带超时的单个协程等待 |
| asyncio.run() | 同步入口，启动事件循环 |

await 和直接调用的区别：

-   result = await coro()：挂起当前协程，事件循环去跑别人，完成后回来拿结果

-   result = coro()：只创建协程对象，什么都不执行（容易踩的坑）

### 3. 对比与拓展

asyncio vs 多线程 vs 多进程：

|  | asyncio | 多线程 | 多进程 |
| --- | --- | --- | --- |
| 适合场景 | I/O 密集（网络、API） | I/O 密集 | CPU 密集（计算） |
| GIL 影响 | 不涉及（单线程，无需锁） | 有（Python 字节码串行） | 无（各自进程） |
| 内存开销 | 几 KB/协程 | ~8 MB/线程 | 更大 |
| 切换成本 | 极低（用户态） | 中（内核态） | 高（进程间通信） |

> 注：asyncio 是**单线程**事件循环，根本不存在多线程争抢，所以"GIL 不影响 asyncio"的本质是**绕过而不是克服 GIL**——只要你在协程里跑纯 CPU 计算，其他协程依然得排队等。

Agent 的工作大部分是"调 API 等结果"，asyncio 是最自然的选择。

## 代码示例

**并发调用多个工具：asyncio.gather**

**带超时保护**

## 面试怎么答

> asyncio 是 Python 的单线程异步框架，基于事件循环和协程。遇到 I/O 等待，协程主动 await 交出控制权，事件循环切到下一个任务；I/O 完成后再切回来继续。
> 
> Agent 需要异步的原因很直接：它的大部分时间花在等——等 LLM 返回、等向量库查询、等工具 API 响应。这些全是 I/O，不是 CPU 计算。asyncio 让 Agent 可以同时发出多个 I/O 请求，谁先好先处理谁，总耗时从"所有请求时间之和"降到"最慢请求的时间"。
> 
> 和多线程比，asyncio 更轻（协程几 KB vs 线程几 MB），切换成本更低（用户态 vs 内核态），也不受 GIL 影响。Agent 里我一般默认用 asyncio，CPU 密集才考虑多进程。

## 高频追问 & 加分点

-   **Q1：**await coro() **和** asyncio.create\_task(coro()) **有什么区别？** await coro() 是串行的——当前协程挂起等 coro 完成才继续；create\_task() 是并发的——立刻把 coro 加入调度队列，当前协程继续跑，两者同时推进。如果要同时发多个请求，必须先 create\_task 再 await，或者用 gather。直接连续 await 是串行不是并发。

-   **Q2：如果** await **了一个同步阻塞函数，会怎样？** 整个事件循环被堵死。await time.sleep(1) 不会挂起，time.sleep 是同步的，它会阻塞整条线程，所有其他协程都得等。正确写法是 await asyncio.sleep(1)，或者用 asyncio.to\_thread(sync\_func) 把同步调用扔到线程池里跑。这是 asyncio 最常见的坑。

-   **Q3：asyncio.gather 一个任务失败，其他任务会怎样？** 默认行为：第一个异常立刻向上抛，其他任务继续跑到完成但结果被丢弃。加 return\_exceptions=True 后，所有任务都会跑完，异常和正常结果混在返回列表里，需要自己判断 isinstance(r, Exception)。Agent 里一般用 return\_exceptions=True，部分工具失败不应该让整步崩掉。

-   **Q4：大量并发协程时，怎么控制并发数？** 用 asyncio.Semaphore。比如同时最多并发 10 个 LLM 请求：sem = asyncio.Semaphore(10); async with sem: result = await call\_llm(...)。不加限制的话，几百个协程同时打 API 容易触发 rate limit。这是生产环境 Agent 的必备防护。
