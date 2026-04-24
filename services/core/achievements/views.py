from rest_framework import generics, permissions
from django.contrib.auth.models import User

from .models import Achievement, UserAchievement
from .serializers import AchievementSerializer, UserAchievementSerializer


class AchievementListView(generics.ListAPIView):
    """List all achievements with unlock status for the current user."""

    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Achievement.objects.all()
        # Hide secret achievements that the user hasn't unlocked
        unlocked_ids = UserAchievement.objects.filter(
            user=self.request.user
        ).values_list("achievement_id", flat=True)
        return qs.exclude(is_secret=True).union(
            qs.filter(id__in=unlocked_ids, is_secret=True)
        )


class UserAchievementListView(generics.ListAPIView):
    """List achievements unlocked by a specific user (for profile display)."""

    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return UserAchievement.objects.filter(user__username=username).select_related(
            "achievement"
        )
