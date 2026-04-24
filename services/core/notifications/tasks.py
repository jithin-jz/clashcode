import logging

from celery import shared_task
from django.contrib.auth import get_user_model

from .utils import send_fcm_push

logger = logging.getLogger(__name__)


@shared_task
def send_push_notification_task(user_id, title, body, data=None):
    """
    Deliver a push notification outside the request/response cycle.
    """
    User = get_user_model()

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning("User %s not found for push notification task", user_id)
        return {"status": "user_not_found", "user_id": user_id}

    try:
        send_fcm_push(user=user, title=title, body=body, data=data or {})
        return {"status": "sent", "user_id": user_id}
    except Exception as exc:
        logger.exception("Push notification task failed for user %s", user_id)
        return {"status": "error", "user_id": user_id, "error": str(exc)}
