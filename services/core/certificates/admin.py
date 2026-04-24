from django.contrib import admin

from .models import UserCertificate


@admin.register(UserCertificate)
class UserCertificateAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "certificate_id",
        "issued_date",
        "is_valid",
        "completion_count",
    )
    search_fields = ("user__username", "user__email", "certificate_id")
    list_filter = ("is_valid", "issued_date")
