# Analytics Service

| Framework | FastAPI |
| --- | --- |
| Monitoring | Prometheus |
| Telemetry | HTTPX |

Metrics proxy service providing real-time cluster telemetry and performance insights for the administrative dashboard.

## Technical Specifications

* Backend: Prometheus Server abstraction
* Aggregation: Memory and CPU usage metrics via PromQL queries
* Security: Internal API masking for Prometheus endpoints

## API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| /stats/cluster | GET | Aggregated memory and CPU usage metrics |
| /health | GET | Prometheus connectivity status |

## Environment Configuration

* PROMETHEUS_URL | Target Prometheus server internal endpoint

## Deployment
* Entrypoint: `uvicorn main:app --host 0.0.0.0 --port 8004`
