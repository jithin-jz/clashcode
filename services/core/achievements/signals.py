"""
Achievement auto-unlock signals.

Listens for challenge completions, streak check-ins, and social actions
to automatically award achievements when conditions are met.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver

from challenges.models import UserProgress
from rewards.models import DailyCheckIn
from users.models import UserFollow
from .services import AchievementService

logger = logging.getLogger(__name__)

# ──── Challenge-based achievements ────

@receiver(post_save, sender=UserProgress)
def check_challenge_achievements(sender, instance, **kwargs):
    if instance.status != "COMPLETED":
        return

    user = instance.user
    
    # Calculate current progress
    completed_count = UserProgress.objects.filter(
        user=user, status="COMPLETED"
    ).count()

    # Update progress for tier achievements
    AchievementService.update_progress(user, "first-blood", completed_count)
    AchievementService.update_progress(user, "rising-coder", completed_count)
    AchievementService.update_progress(user, "challenge-veteran", completed_count)
    AchievementService.update_progress(user, "legend", completed_count)

    # One-off conditions
    if instance.started_at and instance.completed_at:
        elapsed = (instance.completed_at - instance.started_at).total_seconds()
        if elapsed < 120:
            AchievementService.update_progress(user, "speed-demon", 1)

    if instance.stars == 3:
        # For perfectionist, maybe we track total 3-star completions? 
        # Assuming target_value=1 for now as per previous logic
        AchievementService.update_progress(user, "perfectionist", 1)


# ──── Streak-based achievements ────

@receiver(post_save, sender=DailyCheckIn)
def check_streak_achievements(sender, instance, **kwargs):
    user = instance.user
    AchievementService.update_progress(user, "streak-starter", instance.streak_day)
    AchievementService.update_progress(user, "streak-master", instance.streak_day)


# ──── Social achievements ────

@receiver(post_save, sender=UserFollow)
def check_social_achievements(sender, instance, **kwargs):
    follower = instance.follower
    following_count = UserFollow.objects.filter(follower=follower).count()
    
    AchievementService.update_progress(follower, "socializer", following_count)
    AchievementService.update_progress(follower, "networker", following_count)
