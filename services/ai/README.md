# AI Service

| Framework | FastAPI |
| --- | --- |
| RAG | LangChain |
| Vector DB | Pinecone / ChromaDB |
| Provider | Groq / OpenAI |

Context-aware AI tutoring engine providing real-time code analysis and challenge hints using Retrieval-Augmented Generation (RAG).

## Technical Specifications

* Retrieval: Semantic search via vector embeddings
* Analysis: Contextual code evaluation and feedback generation
* Framework: LangChain with customized tool-chains
* Interface: Asynchronous REST API

## Integration Map

* LLM Provider | Groq (Llama 3) / OpenAI (GPT-4)
* Embedding | Text-embedding-3-small (OpenAI)
* Data Source | Markdown-based challenge knowledge base

## API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| /api/ai/analyze | POST | Code evaluation and feedback |
| /api/ai/hint | POST | Contextual challenge hint generation |
| /health | GET | Service and Vector DB connectivity check |

## Deployment
* Entrypoint: `uvicorn main:app --host 0.0.0.0 --port 8002`
