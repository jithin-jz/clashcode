# CLASHCODE Python Executor

Internal Python-only execution service for challenge validation.

It replaces the previous privileged Piston container with a narrower runtime:

- Python only
- no root user
- read-only container filesystem
- no Linux capabilities
- per-run timeout, memory, file-size, process, and output limits
- Python isolated mode (`-I`)
- optional dangerous import blocking
- optional gVisor runtime via `CONTAINER_RUNTIME=runsc`

## gVisor

Install gVisor on the Docker host and set this in `services/.env`:

```env
CONTAINER_RUNTIME=runsc
```

Keep `CONTAINER_RUNTIME=runc` for local development if gVisor is not installed.

This worker is still an internal service and should never be exposed publicly.
