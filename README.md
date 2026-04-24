# 🏰 CLASHCODE

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.2.0-green.svg)

**CLASHCODE** is a comprehensive, gamified coding platform designed to help developers master their skills through interactive challenges, community engagement, and AI-powered tutoring.

## 🏗️ Architecture

The platform uses a modular microservices architecture. For development, we run infrastructure (databases) in Docker and application services locally on the host.

```mermaid
graph TD
    Client[Frontend: React] --> Gateway[Nginx Gateway :80]
    Gateway --> Core[Core: Django :8000]
    Gateway --> Chat[Chat: FastAPI :8001]
    Gateway --> AI[AI: FastAPI :8002]
    
    subgraph Infrastructure (Docker)
        Gateway
        Core --> DB[(PostgreSQL)]
        Core --> Redis[(Redis)]
        Chat --> CDB[(PostgreSQL Chat)]
        Chat --> Dynamo[(DynamoDB Local)]
        AI --> Chroma[(ChromaDB)]
    end
    
    Core --> Celery[Celery Worker/Beat]
```

## 📂 Services & Tech Stack

| Service | Technology | Description |
|---|---|---|
| **[Frontend](frontend/)** | React 19, Zustand, Tailwind | Production-optimized UI for the Code Arena. |
| **[Core API](services/core/)** | Django 5, DRF, Celery | Business Logic, Auth, Store, and Rewards. |
| **[Chat Service](services/chat/)** | FastAPI, WebSockets | Real-time messaging and notifications. |
| **[AI Tutor](services/ai/)** | FastAPI, LangChain | RAG-based AI assistant for code help. |

---

## 🚀 Local Development

### 1. Start Infrastructure
Start the databases and other required services using Docker Compose.
```bash
docker-compose -f services/docker-compose.yml up -d
```

### 2. Backend Services
Run the backend services directly on your host machine.
- **Core**: `cd services/core && python manage.py runserver`
- **Chat**: `cd services/chat && uvicorn main:app --port 8001`
- **AI**: `cd services/ai && uvicorn main:app --port 8002`

See the **[Backend README](services/README.md)** for detailed setup instructions.

### 3. Frontend
Run the frontend development server.
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License.
