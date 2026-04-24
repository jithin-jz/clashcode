from rest_framework import serializers

from .models import UserCertificate


class UserCertificateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    verification_url = serializers.CharField(read_only=True)

    class Meta:
        model = UserCertificate
        fields = [
            "id",
            "certificate_id",
            "username",
            "issued_date",
            "is_valid",
            "completion_count",
            "verification_url",
        ]
        read_only_fields = ["certificate_id", "issued_date"]
