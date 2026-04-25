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

## 🚀 Production-Style Docker Run

The production path is container-first: nginx, the built frontend, Django, FastAPI services, Celery, databases, Redis, Chroma, DynamoDB Local, and the Python-only executor all run on the private Compose network. Only nginx is published to the host.

### 1. Configure Secrets

Copy the example files and replace every placeholder with real production values.

```bash
cp services/.env.example services/.env
cp services/core/.env.example services/core/.env
cp services/chat/.env.example services/chat/.env
cp services/ai/.env.example services/ai/.env
```

Required production values include `SECRET_KEY`, database password, JWT keys, OAuth credentials, SMTP credentials, payment keys, `INTERNAL_API_KEY`, and `INTERNAL_SIGNING_SECRET`.

### 2. Start The Stack

```bash
docker compose -f services/docker-compose.yml up -d --build
```

The gateway is available on `http://localhost` by default, or the port configured by `NGINX_HTTP_PORT`.

## 🛠️ Local Frontend Development

For UI-only development, you can still run Vite locally with `VITE_API_URL=/api` while the Docker stack is running:

```bash
cd frontend
npm install
npm run dev
```

Do not expose Postgres, Redis, Chroma, DynamoDB, or the executor directly in production. For stronger sandboxing, install gVisor on the Docker host and set `CONTAINER_RUNTIME=runsc` in `services/.env`.

---

## 📄 License

This project is licensed under the MIT License.
