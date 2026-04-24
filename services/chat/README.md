# 💬 Chat & Real-Time Service (FastAPI)

A high-concurrency WebSocket server handling all real-time interactions, including room-based messaging and global system notifications.

## ✨ Features

- **WebSockets**: Permanent bidirectional connections for instant messaging.
- **Redis Pub/Sub**: Scales horizontal delivery across multiple pod instances.
- **Stateless Auth**: Verifies user identity via shared JWT Public Key.
- **DynamoDB-backed History**: Stores chat history, reactions, and message mutations in DynamoDB.
- **Notification Types**:
  - Global Announcement (broadcast).
  - Room Messages (targeted).
  - Personal System Alerts (private).

## 🚀 Running Local

```bash
cd services/chat
pip install -r requirements.txt

# Start the service
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## 🗃️ Legacy Migration

If you still have old chat history in PostgreSQL, you can backfill it into DynamoDB once:

```bash
cd services/chat
pip install -r requirements-migrate.txt
python scripts/migrate_postgres_to_dynamo.py --legacy-db-url postgresql://...
```

Notes:
- The script reads from the legacy `chatmessage` table by default.
- It writes directly to DynamoDB and does not restore SQL as a runtime dependency.
- Activity counters are not incremented during migration, so historical backfill will not inflate contribution stats.

## 🔌 WebSocket API

**URL**: `ws://localhost/ws/chat/{room_name}`

### Example Message Protocol (JSON)

```json
{
  "content": "Hello World!",
  "type": "message"
}
```

---

## 🏗️ Architecture

1. **Connection**: Client establishes WS connection to `/ws/chat/{room}`.
2. **Auth**: The service verifies the JWT from the `Authorization` header or auth cookie.
3. **Tracking**: Active connections are stored in memory (`ConnectionManager`).
4. **Persistence**: Chat history and reactions are stored in DynamoDB.
5. **Broadcast**: Messages are published to Redis, and all listening instances relay to their connected clients.

---

## 📂 Structure

- `main.py`: App initialization and route definitions.
- `main.py`: FastAPI app, websocket endpoints, auth, and Redis broadcast loop.
- `dynamo.py`: DynamoDB persistence for chat history, edits, deletes, and reactions.
- `rate_limiter.py`: Redis-backed anti-spam and anti-burst limits.
