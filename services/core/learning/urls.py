from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChallengeViewSet, LeaderboardView

router = DefaultRouter()
router.register(r"challenges", ChallengeViewSet, basename="challenge")

urlpatterns = [
    path("challenges/leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
    path("", include(router.urls)),
]
