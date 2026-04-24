from rest_framework import serializers
from .models import Achievement, UserAchievement


class AchievementSerializer(serializers.ModelSerializer):
    """
    Standard achievement serializer.
    When listed for a user, extra local state (is_unlocked) can be added via context.
    """

    is_unlocked = serializers.SerializerMethodField()
    unlocked_at = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "icon",
            "category",
            "xp_reward",
            "is_secret",
            "is_unlocked",
            "unlocked_at",
        ]

    def get_is_unlocked(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        # If we are being rendered as a nested child of UserAchievement, we are obviously unlocked.
        if "user_achievement" in self.context:
            return True
        return UserAchievement.objects.filter(
            user=request.user, achievement=obj
        ).exists()

    def get_unlocked_at(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return None

        # Optimization: if passed in context, use it.
        if "unlocked_at" in self.context:
            return self.context["unlocked_at"]

        ua = UserAchievement.objects.filter(user=request.user, achievement=obj).first()
        return ua.unlocked_at if ua else None


class UserAchievementSerializer(serializers.ModelSerializer):
    """
    Serializer for achievements a user HAS unlocked.
    Nests the achievement detail.
    """

    achievement = serializers.SerializerMethodField()

    class Meta:
        model = UserAchievement
        fields = ["id", "achievement", "unlocked_at"]

    def get_achievement(self, obj):
        # Pass a flag and the date into context to prevent re-querying in child.
        context = self.context.copy()
        context["user_achievement"] = True
        context["unlocked_at"] = obj.unlocked_at
        return AchievementSerializer(obj.achievement, context=context).data
