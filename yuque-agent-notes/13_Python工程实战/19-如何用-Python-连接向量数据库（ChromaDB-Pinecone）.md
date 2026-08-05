---
title: "19. 如何用 Python 连接向量数据库（ChromaDB-Pinecone）？"
source: https://www.yuque.com/u28128023/mk3u4m/kld1n0m0o200rg43
exported_at: 2026-07-27
---

# 19. 如何用 Python 连接向量数据库（ChromaDB-Pinecone）？

## 知识点讲解

### 1. 核心概念

向量数据库专门存储高维向量，支持近似最近邻（ANN）搜索——在毫秒内从百万向量里找到语义最相近的结果。这是 RAG 的基础设施。

两个最常用的选择：

**ChromaDB**：本地优先，零配置，pip install chromadb 即用。适合开发、原型和中小规模部署。

**Pinecone**：托管云服务，亿级向量，99.9% SLA。适合生产环境大规模 RAG。

核心操作在两者上是一样的：创建集合 → 添加文档（自动或手动 Embedding）→ 查询最相似的文档。

### 2. 技术细节

| 维度 | ChromaDB | Pinecone |
| --- | --- | --- |
| 部署 | 本地进程 / Docker | 托管云服务 |
| 规模 | 百万级（受机器内存限制） | 亿级 |
| 成本 | 免费（开源） | 按向量数量付费 |
| Embedding 集成 | 内置（可自动调 OpenAI/本地模型） | 需手动传入向量 |
| 持久化 | SQLite / 文件系统 | 云端自动 |
| 适用场景 | 开发测试、中小规模 | 生产、大规模 RAG |

**相似度计算**：

-   余弦相似度：文本语义搜索（最常用）

-   欧氏距离：图像检索

-   点积：已归一化向量（等价于余弦）

### 3. 对比与拓展

更多本地向量库选项：FAISS（Meta，极速纯内存，无持久化）、Qdrant（Rust 实现，高性能，支持 REST API）、Milvus（企业级，分布式）。开发用 ChromaDB，生产规模大了就迁 Pinecone 或 Qdrant。

## 代码示例

**ChromaDB：持久化 + OpenAI Embedding**

**Pinecone：批量 Upsert + 查询**

**统一抽象层（切换向量库不改业务代码）**

## 面试怎么答

> 向量数据库存 Embedding 向量，支持 ANN 相似度搜索，是 RAG 的基础组件。ChromaDB 是本地优先的开源库，零配置，内置 OpenAI embedding 集成，适合开发测试；Pinecone 是托管云服务，亿级规模，适合生产。
> 
> 核心操作三步：创建集合 → 写入文档（id + 向量 + metadata）→ 用查询向量检索 top-K。ChromaDB 可以自动帮你调 embedding API，Pinecone 需要手动传向量。
> 
> 生产实践：向量写入用批量 upsert（每批 100 条以内）；查询结果要包含 metadata（原文、来源），不然只有向量 id 没法用；高频查询的 embedding 做 Redis 缓存，省 OpenAI API 费用。

## 高频追问 & 加分点

-   **Q1：ChromaDB 和 Pinecone 的数据可以迁移吗？** 可以，但要自己写迁移脚本。从 ChromaDB 导出（collection.get(include=\["embeddings", "documents", "metadatas"\])）拿到所有向量和 metadata，再批量 upsert 进 Pinecone。两者格式不同，注意 id 映射。加分点：迁移时先并行写两个库验证查询结果一致，再切流量，不要直接下线 ChromaDB。

-   **Q2：向量维度越高越好吗？** 不一定。1536 维（text-embedding-3-small）vs 3072 维（text-embedding-3-large），准确率提升有限（通常 5% 以内），但存储成本翻倍、检索速度降低。大多数场景 1536 维够用。更重要的是 chunking 策略和 Reranker，比换大维度 embedding 效果提升明显。

-   **Q3：如何在 RAG 里实现权限控制（不同用户看不同文档）？** 两种方案：①namespace 隔离（Pinecone 原生支持，ChromaDB 可用 metadata 过滤）——查询时加 namespace 或 metadata 过滤条件，天然隔离；②查询后过滤——检索结果里按用户权限过滤，简单但可能导致实际 top-K 不足。权限复杂的场景推荐方案①，查询级别隔离比结果过滤安全。

-   **Q4：FAISS 和向量数据库的区别？** FAISS 是纯内存的向量检索库（Meta 出品），没有持久化、没有 metadata 存储、没有 HTTP API——只是一个高性能的 C++ 检索核心。向量数据库（ChromaDB、Pinecone、Qdrant）在 FAISS 这类库的基础上加了持久化、CRUD API、元数据过滤、多租户等工程能力。需要极速纯内存检索用 FAISS，生产 RAG 用向量数据库。
