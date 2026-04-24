# 🤖 AI & Code Analysis Service (FastAPI)

An intelligent agentic service that provides code explanation, optimization tips, and RAG-based context for coding challenges.

## ✨ Features

- **Large Language Model**: Powered by **Groq** (using Llama 3.3 70B) for ultra-fast responses.
- **RAG (Retrieval Augmented Generation)**: Uses **ChromaDB** to inject relevant documentation and challenge context into the AI's memory.
- **Asynchronous Processing**: Non-blocking requests for smooth code analysis.
- **Streaming Responses**: (Optional) Instant feedback as the model generates.

## 🚀 Running Local

```bash
cd services/ai
pip install -r requirements.txt

# Start the service
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

## 🛠️ Tech Context

### RAG Pipeline

The service embeds your codebase and challenges into a vector space. When a user asks an AI question:

1. The query is converted to an embedding.
2. ChromaDB finds the most relevant code snippets/instructions.
3. The LLM processes the query + retrieved context.

---

## 🏗️ Technical Settings

- **`MODEL_NAME`**: Default is `llama-3.3-70b-versatile`.
- **`CHROMA_SERVER_HOST`**: Vector storage connection.
- **`EMBEDDING_MODEL`**: `sentence-transformers/all-MiniLM-L6-v2`.

---

## 📂 Structure

- `main.py`: Main API entry point.
- `ai_logic.py`: Prompt engineering and LLM interaction.
- `vector_db.py`: ChromaDB integration and search logic.
- `embeddings.py`: Model definitions for vectorization.
