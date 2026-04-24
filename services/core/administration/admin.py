from django.contrib import admin

from .models import AdminAuditLog


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "timestamp",
        "admin_username",
        "action",
        "target_username",
        "actor_ip",
        "request_id",
    )
    list_filter = ("action", "timestamp")
    search_fields = ("admin_username", "target_username", "request_id")
    ordering = ("-timestamp",)
    readonly_fields = (
        "timestamp",
        "admin",
        "admin_username",
        "action",
        "target_user",
        "target_username",
        "target_email",
        "details",
        "actor_ip",
        "user_agent",
        "request_id",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
