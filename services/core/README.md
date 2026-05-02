# Core Service

| Framework | Django 5 / DRF |
| --- | --- |
| Database | PostgreSQL |
| Tasks | Celery |
| Payments | Razorpay |

Primary API service orchestrating authentication, profile management, gamification, and transaction logic.

## Technical Specifications

* Architecture: Service-View separation (Strict Business Logic Isolation)
* Authentication: JWT with asymmetric signing (RSA)
* Persistence: PostgreSQL with managed RDS integration
* Async: Distributed task processing via Celery with Redis broker

## Feature Map

* Authentication | OAuth2, JWT Rotation, Profile Orchestration
* Gamification | XP Ledger, Level Management, Badge System
* Commerce | Razorpay integration, Shop Inventory management
* Challenges | Content loading via Markdown/YAML parsers

## Management Commands

| Command | Description |
| --- | --- |
| python manage.py migrate | Database schema synchronization |
| python manage.py load_challenges | Populate challenges from /challenges/content |
| python manage.py collectstatic | Asset aggregation for production CDN |

## Deployment
* Entrypoint: `gunicorn core.wsgi:application --bind 0.0.0.0:8000`
