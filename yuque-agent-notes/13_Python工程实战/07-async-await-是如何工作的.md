---
title: "7. async-await 是如何工作的？"
source: https://www.yuque.com/u28128023/mk3u4m/dpqx53047wpsw8na
exported_at: 2026-07-27
---

# 7. async-await 是如何工作的？

## 知识点讲解

### 1. 核心概念

async/await 是 Python 协程的语法层。理解它的关键是搞清三个角色的分工：

async def：把一个函数变成协程函数。调用它不执行，只返回协程对象。真正的执行从被 await 或包装成 Task 那一刻开始。

await：暂停当前协程，把控制权交还给事件循环，等被 await 的对象完成后恢复。await 只能在 async def 函数里用。

**事件循环（Event Loop）**：单线程的调度器。维护一个就绪队列，轮流运行每个任务，谁 await 了就切到下一个，谁的 I/O 完成了就把它放回队列。

整个执行时间线是这样的：

### 2. 技术细节

**协程的状态机本质**

Python 编译器把 async def 函数编译成一个状态机。每个 await 是一个状态转换点：

**Coroutine / Task / Future 的关系**

-   **Coroutine**：协程对象，需要 await 或包进 Task 才跑

-   **Task**：创建即入队，事件循环自动推进

-   **Future**：最底层，由 I/O 库（aiohttp、aiosqlite）创建，LLM SDK 的异步接口本质上是 Future

### 3. 对比与拓展

|  | 多线程 | asyncio 协程 |
| --- | --- | --- |
| 切换时机 | OS 强制（任意时刻） | 程序主动（await 处） |
| 内存开销 | ~8MB/线程 | 几 KB/协程 |
| GIL 影响 | 有（Python 字节码串行） | 无（I/O 等待时释放） |
| 竞态条件 | 容易（任意时刻被抢占） | 较少（await 之间是原子的） |
| 调试难度 | 较高 | 相对低（执行路径可预测） |

asyncio 的竞态条件虽然比多线程少，但两个 await 之间如果有共享可变状态，还是要注意——同一协程内两次 await 之间，别的协程可能修改了共享变量。

## 代码示例

**ReAct Agent 里的并发工具调用**

**超时 + 取消**

## 面试怎么答

> async def 定义协程函数，调用不执行——返回协程对象。await 是"我现在要等一个 I/O，先把控制权让出去"，事件循环趁机跑别的协程，等 I/O 完成后把控制权还回来。
> 
> 协程的底层是状态机，每个 await 是一个状态转换点。事件循环是单线程调度器，维护一个就绪队列，哪个任务 I/O 完成了就放回队列轮到它跑。
> 
> 和多线程比：协程只在 await 处让步，两次 await 之间不会被打断，竞态条件比多线程少得多；内存更省（KB vs MB）；也不受 GIL 限制。
> 
> 一个坑要提：await time.sleep(1) 是错的，time.sleep 是同步阻塞，会把整个事件循环卡死。必须用 asyncio.sleep(1) 或者 asyncio.to\_thread(sync\_func) 把同步操作扔线程池。

## 高频追问 & 加分点

-   **Q1：直接** await coro() **和先** create\_task(coro()) **再 await 有什么区别？** await coro() 是串行——当前协程停着等；create\_task(coro()) 是并发——coro 立刻被加入调度队列，两者同时推进。如果要并发两个请求，必须先 create\_task 再 await，或者用 gather。直接连续两个 await 是串行，顺序跑完，不是并发。

-   **Q2：**asyncio.gather **和** asyncio.wait **怎么选？** 90% 场景用 gather——简单，按输入顺序返回结果，一行搞定。wait 适合需要"谁先完成先处理谁"（asyncio.as\_completed）或者设超时部分完成就继续的场景。FIRST\_COMPLETED 模式在 Agent 的竞速策略里有用：同时问两个模型，谁先回来用谁。

-   **Q3：协程里怎么安全地修改共享状态？** 只要修改操作在两个 await 之间，就是原子的——没有其他协程能插进来。如果修改横跨 await（比如先 await 查状态再 await 写状态），中间可能被其他协程改了，需要用 asyncio.Lock。加分点：asyncio.Lock 和 threading.Lock API 一样，但只能在 async 上下文里用。

-   **Q4：async 生成器在 Agent 流式输出里怎么用？** async def gen() → yield 定义异步生成器，用 async for chunk in gen() 消费。流式 LLM 输出（SSE）最自然的封装就是 async 生成器——每收到一个 chunk 就 yield，调用方实时处理，不用等全部完成。FastAPI 的流式响应也是这个机制。
