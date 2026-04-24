from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.contrib.auth.models import User
from users.models import UserFollow
from posts.models import Post
from .models import Notification
from .tasks import send_push_notification_task


@receiver(
    m2m_changed,
    sender=Post.likes.through,
    dispatch_uid="create_like_notification_signal",
)
def create_like_notification(sender, instance, action, pk_set, **kwargs):
    _ = sender, kwargs
    if action == "post_add":
        for user_id in pk_set:
            actor = User.objects.get(pk=user_id)
            # Don't notify if user likes their own post
            if actor != instance.user:
                Notification.objects.create(
                    recipient=instance.user,
                    actor=actor,
                    verb="liked your post",
                    target=instance,
                )
                send_push_notification_task.delay(
                    instance.user.id,
                    title="New Like!",
                    body=f"{actor.username} liked your post: {instance.caption[:30]}...",
                )


@receiver(
    post_save, sender=UserFollow, dispatch_uid="create_follow_notification_signal"
)
def create_follow_notification(sender, instance, created, **kwargs):
    _ = sender, kwargs
    if created:
        Notification.objects.create(
            recipient=instance.following,
            actor=instance.follower,
            verb="started following you",
            target=instance.following,
        )
        send_push_notification_task.delay(
            instance.following.id,
            title="New Follower!",
            body=f"{instance.follower.username} started following you.",
        )
