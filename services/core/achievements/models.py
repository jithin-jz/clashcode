from django.db import models
from django.contrib.auth.models import User


class Achievement(models.Model):
    """
    Defines an available achievement/badge.
    Achievements are unlocked automatically when conditions are met.
    """

    class Category(models.TextChoices):
        CHALLENGE = "challenge", "Challenge"
        SOCIAL = "social", "Social"
        STREAK = "streak", "Streak"
        SPECIAL = "special", "Special"

    slug = models.SlugField(
        unique=True, help_text="Unique identifier, e.g. 'first-blood'"
    )
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=300)
    icon = models.CharField(
        max_length=50,
        default="Trophy",
        help_text="Lucide icon name to render on frontend",
    )
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.CHALLENGE
    )
    xp_reward = models.IntegerField(default=0, help_text="Bonus XP granted on unlock")
    is_secret = models.BooleanField(default=False, help_text="Hidden until unlocked")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Achievement"
        verbose_name_plural = "Achievements"

    def __str__(self):
        return self.title


class UserAchievement(models.Model):
    """
    Records when a user unlocks an achievement.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="achievements",
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name="unlocked_by",
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "achievement"]
        ordering = ["-unlocked_at"]

    def __str__(self):
        return f"{self.user.username} — {self.achievement.title}"
