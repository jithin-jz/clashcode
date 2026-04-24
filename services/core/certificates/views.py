import logging

from django.shortcuts import get_object_or_404
from rest_framework import decorators, status, viewsets, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiTypes, inline_serializer

from .models import UserCertificate
from .serializers import UserCertificateSerializer
from .services import CertificateService

logger = logging.getLogger(__name__)


class CertificateViewSet(viewsets.ViewSet):
    """
    ViewSet for certificate generation and verification.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserCertificateSerializer, 403: OpenApiTypes.OBJECT},
        description="Get or generate the authenticated user's completion certificate.",
    )
    @decorators.action(detail=False, methods=["get"])
    def my_certificate(self, request):
        user = request.user
        is_eligible = CertificateService.is_eligible(user)
        existing_certificate = UserCertificate.objects.filter(user=user).first()
        if existing_certificate and is_eligible:
            current_completed = CertificateService.get_completed_count(user)
            if existing_certificate.completion_count != current_completed:
                existing_certificate.completion_count = current_completed
                existing_certificate.save(update_fields=["completion_count"])
            serializer = UserCertificateSerializer(
                existing_certificate, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        if not is_eligible:
            status_info = CertificateService.get_eligibility_status(user)
            return Response(
                {
                    "has_certificate": False,
                    "eligible": False,
                    "completed": status_info["completed_challenges"],
                    "required": status_info["required_challenges"],
                    "remaining": status_info["remaining_challenges"],
                },
                status=status.HTTP_200_OK,
            )

        try:
            certificate = CertificateService.get_or_create_certificate(user)
        except ValueError as e:
            logger.error(
                "Certificate eligibility check failed for %s: %s", user.username, e
            )
            return Response(
                {"error": str(e), "has_certificate": False, "eligible": False},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(
                "Failed to create certificate record for %s: %s", user.username, e
            )
            return Response(
                {"error": "Failed to generate certificate. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = UserCertificateSerializer(
            certificate, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        responses={
            200: inline_serializer(
                name="CertificateVerificationResponse",
                fields={
                    "valid": serializers.BooleanField(),
                    "certificate": UserCertificateSerializer(allow_null=True),
                },
            ),
            404: OpenApiTypes.OBJECT,
        },
        description="Verify a certificate by its unique ID.",
    )
    @decorators.action(
        detail=False,
        methods=["get"],
        url_path="verify/(?P<certificate_id>[^/.]+)",
        permission_classes=[AllowAny],
    )
    def verify(self, request, certificate_id=None):
        try:
            certificate = get_object_or_404(
                UserCertificate, certificate_id=certificate_id
            )
            serializer = UserCertificateSerializer(
                certificate, context={"request": request}
            )
            return Response(
                {"valid": certificate.is_valid, "certificate": serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error("Certificate verification error: %s", e)
            return Response(
                {"valid": False, "error": "Certificate not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT},
        description="Check if the authenticated user is eligible for a certificate.",
    )
    @decorators.action(detail=False, methods=["get"])
    def check_eligibility(self, request):
        user = request.user
        status_info = CertificateService.get_eligibility_status(user)
        return Response(status_info, status=status.HTTP_200_OK)
