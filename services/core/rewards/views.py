from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiTypes, inline_serializer
from .models import DailyCheckIn
from .serializers import DailyCheckInSerializer


class CheckInView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DailyCheckInSerializer

    # XP rewards for each cycle day (Day 1 -> 5 XP ... Day 7 -> 35 XP)
    DAILY_REWARDS = {1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35}

    @extend_schema(
        request=None,
        responses={
            201: inline_serializer(
                name="CheckInSuccess",
                fields={
                    "message": serializers.CharField(),
                    "check_in": DailyCheckInSerializer(),
                    "xp_earned": serializers.IntegerField(),
                    "total_xp": serializers.IntegerField(),
                    "cycle_day": serializers.IntegerField(),
                },
            ),
            400: OpenApiTypes.OBJECT,
        },
        description="Process a daily check-in and award XP.",
    )
    def post(self, request):
        """Process a daily check-in."""
        user = request.user
        today = timezone.now().date()

        # Check if user already checked in today
        existing_checkin = DailyCheckIn.objects.filter(
            user=user, check_in_date=today
        ).first()

        if existing_checkin:
            return Response(
                {
                    "error": "Already checked in today",
                    "check_in": DailyCheckInSerializer(existing_checkin).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        from xpoint.services import XPService, StreakService

        # Get current cycle state
        # cycle_day is 1-indexed (1-7)
        cycle_day, cycle_start_date, is_reset = StreakService.get_cycle_state(user)

        # Get XP reward for this cycle day
        xp_reward = self.DAILY_REWARDS.get(cycle_day, 5)

        # Create check-in record
        # Note: 'streak_day' field in model now represents 'cycle_day'
        checkin = DailyCheckIn.objects.create(
            user=user, streak_day=cycle_day, xp_earned=xp_reward
        )

        # Update user's XP using centralized service
        XPService.add_xp(user, xp_reward, source=XPService.SOURCE_CHECK_IN)
        profile = user.profile

        return Response(
            {
                "message": f"Check-in successful! Day {cycle_day} of cycle.",
                "check_in": DailyCheckInSerializer(checkin).data,
                "xp_earned": xp_reward,
                "total_xp": profile.xp,
                "streak_day": cycle_day,  # kept for frontend compatibility
                "cycle_day": cycle_day,
                "is_new_cycle": is_reset,
                "cycle_start_date": cycle_start_date,
            },
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        responses={
            200: inline_serializer(
                name="CheckInStatus",
                fields={
                    "checked_in_today": serializers.BooleanField(),
                    "cycle_day": serializers.IntegerField(),
                    "today_checkin": DailyCheckInSerializer(allow_null=True),
                    "recent_checkins": DailyCheckInSerializer(many=True),
                },
            )
        },
        description="Get user's check-in status and history for the current cycle.",
    )
    def get(self, request):
        """Get user's check-in status and history."""
        user = request.user
        today = timezone.now().date()

        from xpoint.services import StreakService

        # Get current cycle state (this handles resetting if needed)
        cycle_day, cycle_start_date, is_reset = StreakService.get_cycle_state(user)

        # Check today's check-in
        today_checkin = DailyCheckIn.objects.filter(
            user=user, check_in_date=today
        ).first()

        # Get check-ins for the CURRENT cycle only
        current_cycle_checkins = DailyCheckIn.objects.filter(
            user=user, check_in_date__gte=cycle_start_date
        )

        return Response(
            {
                "checked_in_today": today_checkin is not None,
                "current_streak": (cycle_day if today_checkin else (cycle_day - 1)),
                "cycle_day": cycle_day,
                "cycle_start_date": cycle_start_date,
                "today_checkin": (
                    DailyCheckInSerializer(today_checkin).data
                    if today_checkin
                    else None
                ),
                "recent_checkins": DailyCheckInSerializer(
                    current_cycle_checkins, many=True
                ).data,
                "daily_rewards": self.DAILY_REWARDS,
            },
            status=status.HTTP_200_OK,
        )
