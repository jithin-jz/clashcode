from django.utils import timezone
from .models import Challenge, UserProgress
from xpoint.services import XPService


class ChallengeService:
    """
    Service layer for handling Challenge interactions.
    Encapsulates logic for progression, locking, hints, and submissions.
    """

    @staticmethod
    def get_annotated_challenges(user, queryset=None):
        """
        Returns a list of challenges annotated with status and stars for the given user.
        Handles the implicit locking logic (Next level unlocked only if previous is completed).
        """
        if queryset is None:
            queryset = Challenge.objects.all()

        challenges = queryset.order_by("order")

        # optimized: fetch all progress in one query
        progress_map = {
            p.challenge_id: p for p in UserProgress.objects.filter(user=user)
        }

        results = []
        previous_completed = True  # Level 1 is always unlocked

        for challenge in challenges:
            p = progress_map.get(challenge.id)

            status = UserProgress.Status.LOCKED
            stars = 0

            if p:
                status = p.status
                stars = p.stars

            # Implicit unlocking logic
            if status == UserProgress.Status.LOCKED and previous_completed:
                status = UserProgress.Status.UNLOCKED

            # Prepare data object (similar to what serializer expects)
            # We preserve the model instance but attach dynamic fields
            challenge.user_status = status
            challenge.user_stars = stars

            results.append(challenge)

            # Update flag for next iteration
            previous_completed = status == UserProgress.Status.COMPLETED

        return results

    @staticmethod
    def get_challenge_details(user, challenge):
        """
        Retrieves detailed challenge info and tracks start time.
        """
        progress, created = UserProgress.objects.get_or_create(
            user=user, challenge=challenge
        )

        # Set start time on first access
        if not progress.started_at:
            progress.started_at = timezone.now()
            progress.save(update_fields=["started_at"])

        return {
            "status": progress.status,
            "stars": progress.stars,
            "ai_hints_purchased": progress.ai_hints_purchased,
            "started_at": progress.started_at,
        }

    @staticmethod
    def process_submission(user, challenge, passed=False):
        """
        Handles success/failure of a code submission.
        """
        if not passed:
            return {"status": "failed"}

        progress, _ = UserProgress.objects.get_or_create(user=user, challenge=challenge)

        # Calculate Stars based on AI hints and completion time
        # 3 Stars: No AI hints + fast completion
        # 2 Stars: 1 AI hint OR moderate time
        # 1 Star: 2+ AI hints OR very slow

        stars = 3

        # Penalty for AI hints (-1 star per hint)
        stars -= progress.ai_hints_purchased

        # Penalty for slow completion time
        if progress.started_at:
            completion_time = (timezone.now() - progress.started_at).total_seconds()
            # Lose 1 star if took more than 2x target time
            if completion_time > 2 * challenge.target_time_seconds:
                stars -= 1

        # Ensure minimum 1 star
        stars = max(1, stars)

        newly_completed = progress.status != UserProgress.Status.COMPLETED

        # Update Progress
        # If already completed, only update if we got more stars?
        # Typically we just keep the best result.
        if newly_completed or stars > progress.stars:
            progress.status = UserProgress.Status.COMPLETED
            progress.completed_at = timezone.now()
            progress.stars = max(progress.stars, stars)
            progress.save()

            # Award XP only on first completion
            if newly_completed:
                xp_earned = challenge.xp_reward
                XPService.add_xp(user, xp_earned, source="challenge_completion")

        next_slug = ChallengeService._get_next_level_slug(challenge, user)

        # Certificate generation is handled automatically by signals.
        # Eligibility threshold comes from the configured global level set.

        return {
            "status": "completed" if newly_completed else "already_completed",
            "xp_earned": xp_earned if newly_completed else 0,
            "stars": stars,
            "next_level_slug": next_slug,
        }

    @staticmethod
    def purchase_ai_assist(user, challenge):
        """
        Purchases the next AI hint level, deducting progressive XP.
        1st hint: 10 XP
        2nd hint: 20 XP
        3rd hint: 30 XP
        """
        progress, _ = UserProgress.objects.get_or_create(user=user, challenge=challenge)

        if progress.ai_hints_purchased >= 3:
            raise PermissionError("Maximum of 3 AI hints allowed for this challenge.")

        current_count = progress.ai_hints_purchased
        cost = 10 * (current_count + 1)

        try:
            remaining_xp = XPService.add_xp(user, -cost, source="ai_assist")
        except ValueError as exc:
            raise PermissionError("Insufficient XP") from exc

        progress.ai_hints_purchased += 1
        progress.save(update_fields=["ai_hints_purchased"])

        return remaining_xp

    @staticmethod
    def _get_next_level_slug(current_challenge, user):
        """Get the next level slug (all challenges are global now)."""
        next_challenge = (
            Challenge.objects.filter(order__gt=current_challenge.order)
            .order_by("order")
            .first()
        )
        return next_challenge.slug if next_challenge else None
