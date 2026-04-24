from rest_framework import serializers
from .models import Challenge, UserProgress


class ChallengePublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "initial_code",
            "test_code",
            "order",
            "xp_reward",
            "time_limit",
            "target_time_seconds",
            "created_for_user",
        ]


class ChallengeAdminSerializer(serializers.ModelSerializer):
    created_for_user_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Challenge
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "initial_code",
            "test_code",
            "order",
            "xp_reward",
            "time_limit",
            "target_time_seconds",
            "created_for_user",
            "created_for_user_id",
        ]


class UserProgressSerializer(serializers.ModelSerializer):
    challenge_id = serializers.IntegerField(source="challenge.id")

    class Meta:
        model = UserProgress
        fields = ["challenge_id", "status", "stars", "completed_at"]
