# ⚙️ Core Service (Django)

The central heartbeat of the **CLASHCODE** ecosystem. This service manages user identities, persistence, transactions, and background task orchestration.

## ✨ Features

- **Advanced Auth**:
  - OAuth 2.0 (Google & GitHub).
  - OTP-based login (Email verification via AWS SES).
  - Dual-mode JWT (Auth header + HttpOnly Cookies).
- **Gamification Engine**: Logic for XP, Levels, and Leaderboards.
- **Store & Payments**: Cosmetic item catalog with Razorpay integration.
- **Notifications**: Firebase Cloud Messaging (FCM) push notification triggers.
- **Async Processing**: Robust background tasks via Celery (Redis backend).

## 🚀 Development Setup

### 1. Prerequisites

- Python 3.12+
- Redis (running on default port)
- PostgreSQL (or Supabase URL)

### 2. Manual Setup

```bash
cd services/core
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Initial migrations
python manage.py migrate

# Seed data
python manage.py load_levels   # Challenges
python manage.py seed_store     # Store items

# Start the server
python manage.py runserver 8000
```

### 3. Running Workers

```bash
# Background task worker
celery -A project worker -l info

# Scheduled tasks (Leaderboard/Cleanup)
celery -A project beat -l info
```

## 📊 Core API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/otp/` | POST | Request login code. |
| `/auth/login/` | POST | Verify OTP & get JWT. |
| `/challenges/` | GET | List available coding challenges. |
| `/store/items/` | GET | List cosmetic items. |
| `/health/` | GET | Service status & healthcheck. |

---

## 🏗️ Technical Notes

### JWT Configuration

Production should use **RS256** asymmetric keys.

- **`JWT_PRIVATE_KEY`**: Used by Core to sign tokens.
- **`JWT_PUBLIC_KEY`**: Shared with Chat/AI services to verify identity without database lookups.

For local development, you can omit the RSA keys and set **`JWT_SHARED_SECRET`** instead. Core and Chat will automatically fall back to `HS256`.

### Media Storage

Cloudinary is supported for deployment, but local development now falls back to filesystem media storage when Cloudinary credentials are not provided.

### Database Seeding

The project bundles several management commands for bootstrapping production data:

- `python manage.py createsuperuser`
- `python manage.py load_levels` (requires `challenges/levels.py`)
- `python manage.py seed_store` (requires `store/seed_store.py`)

---

## 📂 Structure

- `auth/`: Authentication logic & OAuth callback handlers.
- `challenges/`: Level management and challenge definitions.
- `notifications/`: Firebase push logic (utils.py).
- `project/`: Main settings, WSGI/ASGI, and Celery config.
- `store/`: Cosmetic items and purchase logic.
