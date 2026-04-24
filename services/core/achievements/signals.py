"""
Achievement auto-unlock signals.

Listens for challenge completions, streak check-ins, and social actions
to automatically award achievements when conditions are met.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from challenges.models import UserProgress
from rewards.models import DailyCheckIn
from users.models import UserFollow
from .models import Achievement, UserAchievement


def _grant(user, slug):
    """Grant achievement by slug if not already unlocked."""
    try:
        achievement = Achievement.objects.get(slug=slug)
        _, created = UserAchievement.objects.get_or_create(
            user=user, achievement=achievement
        )
        if created and achievement.xp_reward:
            profile = user.profile
            profile.xp += achievement.xp_reward
            profile.save(update_fields=["xp"])
        return created
    except Achievement.DoesNotExist:
        return False


# ──── Challenge-based achievements ────


@receiver(post_save, sender=UserProgress)
def check_challenge_achievements(sender, instance, **kwargs):
    _ = sender, kwargs
    if instance.status != "COMPLETED":
        return

    user = instance.user

    try:
        # First Blood — complete any challenge
        completed_count = UserProgress.objects.filter(
            user=user, status="COMPLETED"
        ).count()

        if completed_count >= 1:
            _grant(user, "first-blood")

        if completed_count >= 5:
            _grant(user, "rising-coder")

        if completed_count >= 10:
            _grant(user, "challenge-veteran")

        if completed_count >= 25:
            _grant(user, "legend")

        # Speed Demon — completed in under 2 minutes
        if instance.started_at and instance.completed_at:
            elapsed = (instance.completed_at - instance.started_at).total_seconds()
            if elapsed < 120:
                _grant(user, "speed-demon")

        # Perfect Score — 3 stars
        if instance.stars == 3:
            _grant(user, "perfectionist")
    except Exception as e:
        import logging

        logging.getLogger("achievements").warning(
            f"Error checking challenge achievements: {e}"
        )


# ──── Streak-based achievements ────


@receiver(post_save, sender=DailyCheckIn)
def check_streak_achievements(sender, instance, **kwargs):
    _ = sender, kwargs
    user = instance.user

    try:
        if instance.streak_day >= 3:
            _grant(user, "streak-starter")

        if instance.streak_day >= 7:
            _grant(user, "streak-master")
    except Exception as e:
        import logging

        logging.getLogger("achievements").warning(
            f"Error checking streak achievements: {e}"
        )


# ──── Social achievements ────


@receiver(post_save, sender=UserFollow)
def check_social_achievements(sender, instance, **kwargs):
    _ = sender, kwargs
    follower = instance.follower

    try:
        following_count = UserFollow.objects.filter(follower=follower).count()
        if following_count >= 1:
            _grant(follower, "socializer")

        if following_count >= 10:
            _grant(follower, "networker")
    except Exception as e:
        import logging

        logging.getLogger("achievements").warning(
            f"Error checking social achievements: {e}"
        )
