"""
Certificate Service
Centralized logic for certificate eligibility, generation, and management.
"""

import logging

from challenges.models import UserProgress
from challenges.levels import LEVELS

from .models import UserCertificate

logger = logging.getLogger(__name__)


class CertificateService:
    """Service for managing user certificates."""

    @staticmethod
    def get_required_challenges():
        return len(LEVELS)

    @staticmethod
    def is_eligible(user):
        completed_count = CertificateService.get_completed_count(user)
        return completed_count >= CertificateService.get_required_challenges()

    @staticmethod
    def get_completed_count(user):
        required_orders = {level["order"] for level in LEVELS}
        completed_orders = set(
            UserProgress.objects.filter(
                user=user,
                status=UserProgress.Status.COMPLETED,
                challenge__created_for_user__isnull=True,
            ).values_list("challenge__order", flat=True)
        )
        return len(required_orders.intersection(completed_orders))

    @staticmethod
    def get_or_create_certificate(user):
        required = CertificateService.get_required_challenges()
        if not CertificateService.is_eligible(user):
            completed = CertificateService.get_completed_count(user)
            raise ValueError(
                f"User not eligible. Completed {completed}/{required} challenges."
            )

        certificate, created = UserCertificate.objects.get_or_create(
            user=user,
            defaults={"completion_count": CertificateService.get_completed_count(user)},
        )

        if not created:
            current_count = CertificateService.get_completed_count(user)
            if current_count != certificate.completion_count:
                certificate.completion_count = current_count
                certificate.save(update_fields=["completion_count"])
                logger.info(
                    "Updated certificate completion count for %s: %s challenges",
                    user.username,
                    certificate.completion_count,
                )
        else:
            logger.info("Created new certificate for %s", user.username)

        return certificate

    @staticmethod
    def has_certificate(user):
        certificate = getattr(user, "certificate", None)
        if not certificate:
            return False
        required = CertificateService.get_required_challenges()
        return bool(certificate.is_valid and certificate.completion_count >= required)

    @staticmethod
    def get_eligibility_status(user):
        completed_count = CertificateService.get_completed_count(user)
        required = CertificateService.get_required_challenges()
        is_eligible = completed_count >= required
        has_cert = CertificateService.has_certificate(user)

        return {
            "eligible": is_eligible,
            "completed_challenges": completed_count,
            "required_challenges": required,
            "has_certificate": has_cert,
            "remaining_challenges": max(0, required - completed_count),
        }
