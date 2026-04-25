import logging
from typing import List, Optional
from django.db import transaction
from django.db.models import QuerySet
from django.contrib.auth.models import User
from .models import Achievement, UserAchievement, UserAchievementProgress

logger = logging.getLogger(__name__)

class AchievementService:
    @staticmethod
    def get_user_visible_achievements(user: User) -> QuerySet:
        """
        Retrieves all achievements visible to the user.
        Includes all non-secret achievements and any secret ones they have unlocked.
        """
        qs = Achievement.objects.all()
        unlocked_ids = UserAchievement.objects.filter(
            user=user
        ).values_list("achievement_id", flat=True)
        
        # Secret achievements are only visible if unlocked
        return qs.exclude(is_secret=True) | qs.filter(id__in=unlocked_ids, is_secret=True)

    @staticmethod
    def get_user_unlocked_achievements(username: str) -> QuerySet:
        """Retrieves achievements unlocked by a specific user."""
        return UserAchievement.objects.filter(
            user__username=username
        ).select_related("achievement")

    @staticmethod
    def update_progress(user: User, slug: str, current_value: int) -> bool:
        """
        Updates progress for a specific achievement.
        If current_value >= target_value, the achievement is unlocked.
        """
        try:
            achievement = Achievement.objects.get(slug=slug)
            
            # Check if already unlocked
            if UserAchievement.objects.filter(user=user, achievement=achievement).exists():
                return False

            with transaction.atomic():
                # Update or create progress
                progress, _ = UserAchievementProgress.objects.get_or_create(
                    user=user, 
                    achievement=achievement
                )
                
                # Only update if value is higher (prevent regressions if event order is weird)
                if current_value > progress.current_value:
                    progress.current_value = current_value
                    progress.save()

                # Check for unlock
                if progress.current_value >= achievement.target_value:
                    return AchievementService.grant_achievement(user, achievement)
            
            return False
        except Achievement.DoesNotExist:
            logger.warning(f"Attempted to update progress for non-existent achievement: {slug}")
            return False
        except Exception as e:
            logger.error(f"Error updating achievement progress: {e}", exc_info=True)
            return False

    @staticmethod
    def grant_achievement(user: User, achievement: Achievement) -> bool:
        """Grants an achievement and its rewards."""
        user_ach, created = UserAchievement.objects.get_or_create(
            user=user, 
            achievement=achievement
        )
        
        if created:
            logger.info(f"User {user.username} unlocked achievement: {achievement.title}")
            
            # Grant XP Reward
            if achievement.xp_reward:
                profile = getattr(user, 'profile', None)
                if profile:
                    profile.xp += achievement.xp_reward
                    profile.save(update_fields=["xp"])
            
            # TODO: Trigger Real-time Notification via Redis/WebSocket
            
        return created
