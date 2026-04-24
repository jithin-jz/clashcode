from rest_framework import serializers
from .models import DailyCheckIn


class DailyCheckInSerializer(serializers.ModelSerializer):
    """
    Serializer for the DailyCheckIn model.
    Used to return confirmation of successful check-ins and history.
    """

    class Meta:
        model = DailyCheckIn
        fields = ["id", "check_in_date", "streak_day", "xp_earned", "created_at"]
        read_only_fields = ["id", "check_in_date", "created_at"]
