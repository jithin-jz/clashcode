# Chat Service

| Framework | FastAPI |
| --- | --- |
| Transport | WebSockets |
| Persistence | Amazon DynamoDB |
| Cache | Redis |

High-concurrency messaging engine providing real-time communication and presence tracking.

## Technical Specifications

* Protocol: Full-duplex WebSockets (WSS)
* State: Distributed session management via Redis Pub/Sub
* Persistence: Asynchronous DynamoDB integration with recursive Decimal serialization
* Security: JWT-based handshake validation

## API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| /ws/chat/{room} | WS | Real-time messaging channel |
| /api/chat/history | GET | Paginated message history retrieval |
| /health | GET | Service health and DynamoDB connectivity check |

## Environment Configuration

* AWS_REGION | Target DynamoDB region
* DYNAMODB_TABLE | Primary message store
* REDIS_URL | Pub/Sub and Presence backend
* INTERNAL_API_KEY | Service-to-service authentication

## Deployment

Containerized deployment via EKS.
* Entrypoint: `uvicorn main:app --host 0.0.0.0 --port 8001`
