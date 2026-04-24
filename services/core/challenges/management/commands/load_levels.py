"""
Django Management Command: Load Levels
Loads global challenges from levels.py into the database.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from challenges.models import Challenge
from challenges.levels import LEVELS


class Command(BaseCommand):
    help = "Load levels from levels.py into the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing global challenges before loading",
        )

    def handle(self, *args, **options):
        target_orders = {level_data["order"] for level_data in LEVELS}

        if options["clear"]:
            self.stdout.write(
                self.style.WARNING("Clearing existing global challenges...")
            )
            deleted = Challenge.objects.filter(created_for_user__isnull=True).delete()
            self.stdout.write(
                self.style.SUCCESS(f"  ✓ Deleted {deleted[0]} challenges")
            )
        else:
            stale_qs = Challenge.objects.filter(created_for_user__isnull=True).exclude(
                order__in=target_orders
            )
            stale_count = stale_qs.count()
            if stale_count:
                stale_qs.delete()
                self.stdout.write(
                    self.style.WARNING(
                        f"Removed {stale_count} stale global challenges not present in levels.py"
                    )
                )

        self.stdout.write(self.style.HTTP_INFO(f"Loading {len(LEVELS)} levels..."))

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for level_data in LEVELS:
                order = level_data["order"]
                existing_qs = Challenge.objects.filter(
                    created_for_user__isnull=True,
                    order=order,
                )
                challenge = existing_qs.first()
                created = challenge is None

                if created:
                    challenge = Challenge(created_for_user=None, order=order)
                else:
                    # Keep one canonical row per global order.
                    duplicate_qs = existing_qs.exclude(pk=challenge.pk)
                    if duplicate_qs.exists():
                        removed = duplicate_qs.count()
                        duplicate_qs.delete()
                        self.stdout.write(
                            self.style.WARNING(
                                f"  ! Removed {removed} duplicate row(s) for order {order}"
                            )
                        )

                challenge.title = level_data["title"]
                challenge.slug = level_data["slug"]
                challenge.description = level_data["description"]
                challenge.initial_code = level_data["initial_code"]
                challenge.test_code = level_data["test_code"]
                challenge.xp_reward = level_data["xp_reward"]
                challenge.target_time_seconds = level_data["target_time_seconds"]
                challenge.created_for_user = None
                challenge.save()

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"  ✓ Created: {challenge.title}")
                    )
                else:
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f"  ↻ Updated: {challenge.title}")
                    )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("✓ Levels Loading Complete!"))
        self.stdout.write(
            self.style.SUCCESS(f"  - Created: {created_count} challenges")
        )
        self.stdout.write(
            self.style.SUCCESS(f"  - Updated: {updated_count} challenges")
        )
        self.stdout.write(
            self.style.SUCCESS(f"  - Total: {created_count + updated_count} challenges")
        )
        self.stdout.write(self.style.SUCCESS("=" * 50))
