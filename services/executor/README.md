# Executor Service

| Framework | FastAPI |
| --- | --- |
| Isolation | Docker SDK |
| Security | AST Validation |

Hardened code evaluation engine designed for secure execution of untrusted user-submitted logic.

## Security Architecture

* Pre-validation: Abstract Syntax Tree (AST) analysis to prevent dangerous library imports.
* Isolation: Network-less, non-root Docker containers with strict CPU/Memory quotas.
* Ephemerality: One-shot container lifecycle for each execution request.
* Fallback: Secure host-level execution available for container-less environments.

## API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| /api/execute | POST | Synchronous code evaluation |
| /health | GET | Docker daemon and service status |

## Technical Constraints

* Timeout | 5000ms (Configurable)
* Memory | 128MB (Configurable)
* Network | Restricted (Egress Disabled)

## Deployment
* Required: Docker Socket (`/var/run/docker.sock`) mount access.
* Entrypoint: `uvicorn main:app --host 0.0.0.0 --port 8003`
