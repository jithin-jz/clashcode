from datetime import datetime
from decimal import Decimal

import pytest
from dynamo import DynamoClient


def test_production_dynamo_keeps_configured_aws_credentials(monkeypatch):
    monkeypatch.delenv("DYNAMODB_URL", raising=False)
    monkeypatch.setenv("AWS_REGION", "ap-south-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test-access-key")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test-secret-key")

    client = DynamoClient()

    assert client.creds["region_name"] == "ap-south-1"
    assert client.creds["aws_access_key_id"] == "test-access-key"
    assert client.creds["aws_secret_access_key"] == "test-secret-key"


def test_local_dynamo_ignores_dummy_credentials(monkeypatch):
    monkeypatch.setenv("DYNAMODB_URL", "http://dynamodb:8000")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "dummy")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "dummy")

    client = DynamoClient()

    assert client.creds["endpoint_url"] == "http://dynamodb:8000"
    assert "aws_access_key_id" not in client.creds
    assert "aws_secret_access_key" not in client.creds


@pytest.mark.asyncio
async def test_numeric_timestamp_key_uses_epoch_milliseconds(monkeypatch):
    monkeypatch.delenv("DYNAMODB_URL", raising=False)
    client = DynamoClient()
    client._timestamp_key_type = "N"

    timestamp = "2026-05-02T13:45:00+05:30"
    expected = Decimal(int(datetime.fromisoformat(timestamp).timestamp() * 1000))

    assert await client._db_timestamp(timestamp) == expected


def test_client_timestamp_prefers_created_at_for_numeric_items(monkeypatch):
    monkeypatch.delenv("DYNAMODB_URL", raising=False)
    client = DynamoClient()

    item = {
        "timestamp": Decimal("1777709700000"),
        "created_at": "2026-05-02T13:45:00+05:30",
    }

    assert client._client_timestamp(item) == "2026-05-02T13:45:00+05:30"
