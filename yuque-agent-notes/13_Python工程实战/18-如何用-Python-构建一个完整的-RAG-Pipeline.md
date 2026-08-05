---
title: "18. 如何用 Python 构建一个完整的 RAG Pipeline？"
source: https://www.yuque.com/u28128023/mk3u4m/ggzkb4zonvl41gby
exported_at: 2026-07-27
---

# 18. 如何用 Python 构建一个完整的 RAG Pipeline？

## 知识点讲解

### 1. 核心概念

RAG（Retrieval-Augmented Generation，检索增强生成）解决 LLM 两个核心缺陷：知识截止日期和幻觉。

核心逻辑很简单：先从知识库里找和问题最相关的文档，把这些文档拼进 prompt，让 LLM 基于真实资料回答，而不是靠"记忆"生成。

完整 Pipeline 分两个阶段：

**离线（摄取）阶段**：

**在线（查询）阶段**：

### 2. 技术细节

每个环节的关键决策：

| 环节 | 关键决策 | 常见选择 |
| --- | --- | --- |
| 分块 | chunk size / overlap | 400 tokens，50 tokens overlap |
| Embedding | 模型选择 | text-embedding-3-small（OpenAI）、bge-m3（开源） |
| 向量库 | 规模 / 部署 | ChromaDB（本地开发）、Pinecone（生产云端） |
| 检索 | Top-K / 检索方式 | K=3-5，纯向量或混合（向量+BM25） |
| 生成 | Prompt 格式 | 上下文+问题+指令，让 LLM 标注来源 |

**常见优化**：

-   **Reranker**：用小模型对初步检索结果重新排序，精度显著提升

-   **混合检索**：向量相似度 + BM25 关键词，互补两者优势

-   **查询扩展**：让 LLM 把用户问题改写成多个版本，覆盖更多相关文档

### 3. 对比与拓展

RAG vs 微调：RAG 动态更新知识（改向量库就行），微调需要重新训练。大多数知识密集型任务先 RAG，微调只用在风格、格式或特定领域专业词汇调整上。

## 代码示例

**完整 RAG Pipeline**

**评估检索质量**

## 面试怎么答

> RAG 分两阶段：离线摄取（文档 → 分块 → embedding → 存向量库）和在线查询（问题 → embedding → 向量检索 → 拼 prompt → LLM 生成）。
> 
> 每个环节都有关键参数。分块：chunk\_size 400 tokens，overlap 50 tokens；embedding 模型：text-embedding-3-small 性价比最高；检索：top\_k=3-5，纯向量检索准确率不够时加 BM25 混合。
> 
> 常见质量问题和对策：检索不准 → 优化 chunking 策略或加 Reranker；LLM 幻觉 → 在 prompt 里强调"只基于参考资料回答"、让它标注来源；回答不相关 → 检查 embedding 模型是否支持目标语言，考虑换中文向量模型（如 bge-m3）。

## 高频追问 & 加分点

-   **Q1：如何评估 RAG 的质量？** 两个维度：检索质量（Recall@K——目标文档在 top-K 里的比例）和生成质量（Faithfulness——答案有没有超出检索内容瞎编；Answer Relevance——答案是否回应了问题）。RAGAS 是专门评估 RAG 的库，可以用 LLM-as-Judge 自动评这些指标。

-   **Q2：RAG 检索结果不相关怎么排查？** 分步排查：①检查 embedding 模型是否适配语言（中文问题配英文模型效果差）；②查看 chunk 质量（太短信息不完整，太长相似度被稀释）；③看 top-K 的相似度分数分布（分数都很低说明知识库里没有相关内容）；④试试混合检索，向量没检到的靠关键词补。

-   **Q3：Reranker 加在哪里，有多大效果？** 在向量检索之后、LLM 生成之前。先用向量检索取 top-20，再用 Reranker（如 BGE-Reranker）精排取 top-3。典型效果：recall@3 从 60% 提升到 80%+。代价是多一次模型推理延迟（reranker 通常是小模型，50-200ms）。
