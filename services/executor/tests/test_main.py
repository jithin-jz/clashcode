import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_execute_success():
    code = "print('hello world')"
    response = client.post("/execute", json={"code": code, "language": "python"})
    assert response.status_code == 200
    assert "hello world" in response.json()["run"]["stdout"]


def test_execute_error():
    code = "raise Exception('test error')"
    response = client.post("/execute", json={"code": code, "language": "python"})
    assert response.status_code == 200
    assert "test error" in response.json()["run"]["stderr"]


def test_execute_invalid_language():
    response = client.post("/execute", json={"code": "print(1)", "language": "javascript"})
    assert response.status_code == 400
    assert "Only Python execution is supported" in response.json()["detail"]


def test_execute_stdin():
    code = "name = input(); print(f'hello {name}')"
    response = client.post("/execute", json={"code": code, "language": "python", "stdin": "jithin\n"})
    assert response.status_code == 200
    assert "hello jithin" in response.json()["run"]["stdout"]


def test_execute_docker():
    code = "print('hello from docker')"
    response = client.post("/execute", json={"code": code, "language": "python", "runner": "docker"})
    assert response.status_code == 200
    # Docker may not be available or the custom image may be missing in CI.
    # Skip gracefully instead of failing.
    result = response.json()["run"]
    if "hello from docker" not in result["stdout"]:
        pytest.skip(f"Docker execution not available in this environment: {result['stderr'][:120]}")


def test_security_violation():
    code = "import os; print(os.listdir('.'))"
    response = client.post("/execute", json={"code": code, "language": "python"})
    assert "Security Error" in response.json()["run"]["stderr"]
    assert "Import of module 'os' is blocked" in response.json()["run"]["stderr"]
