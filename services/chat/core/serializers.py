import json
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super().default(o)


def json_dumps(obj: Any) -> str:
    return json.dumps(obj, cls=DecimalEncoder)


def serialize_timestamp(value: Any) -> Any:
    if not isinstance(value, Decimal):
        return value

    divisor = Decimal(1000) if abs(value) > Decimal("100000000000") else Decimal(1)
    return datetime.fromtimestamp(float(value / divisor), tz=timezone.utc).isoformat()


def serialize_dynamo_message(room: str, item: dict) -> dict:
    """Safely serialize a DynamoDB item for the frontend."""
    timestamp = item.get("created_at") or item.get("iso_timestamp") or item.get("timestamp")
    return {
        "room": room,
        "message": item.get("content", ""),
        "user_id": item.get("user_id"),
        "username": item.get("sender") or item.get("username") or "Unknown",
        "avatar_url": item.get("avatar_url"),
        "timestamp": serialize_timestamp(timestamp),
        "reactions": item.get("reactions", {}),
    }
