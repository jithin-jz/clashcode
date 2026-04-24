from django.urls import path
from .views import (
    AdminStatsView,
    UserListView,
    UserBlockToggleView,
    UserDeleteView,
    UserDetailsView,
    UserRoleUpdateView,
    UserBulkActionView,
    UserExportView,
    UserNotesView,
    ChallengeAnalyticsView,
    StoreAnalyticsView,
    GlobalNotificationView,
    BroadcastHistoryView,
    BroadcastResendView,
    AdminAuditLogView,
    SystemIntegrityView,
    SystemHealthView,
    UserEngagementAnalyticsView,
    UltimateAnalyticsView,
    AdminReportsView,
    AdminReportDetailView,
    StoreItemDuplicateView,
)

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin_stats"),
    path(
        "analytics/challenges/",
        ChallengeAnalyticsView.as_view(),
        name="admin_challenge_analytics",
    ),
    path(
        "analytics/store/", StoreAnalyticsView.as_view(), name="admin_store_analytics"
    ),
    path(
        "analytics/engagement/",
        UserEngagementAnalyticsView.as_view(),
        name="admin_engagement_analytics",
    ),
    path(
        "analytics/ultimate/",
        UltimateAnalyticsView.as_view(),
        name="admin_ultimate_analytics",
    ),
    path("audit-logs/", AdminAuditLogView.as_view(), name="admin_audit_logs"),
    path(
        "notifications/history/",
        BroadcastHistoryView.as_view(),
        name="admin_broadcast_history",
    ),
    path(
        "notifications/history/<str:request_id>/resend/",
        BroadcastResendView.as_view(),
        name="admin_broadcast_resend",
    ),
    path(
        "notifications/broadcast/",
        GlobalNotificationView.as_view(),
        name="admin_broadcast",
    ),
    path("users/", UserListView.as_view(), name="admin_user_list"),
    path("users/export/", UserExportView.as_view(), name="admin_user_export"),
    path("users/bulk/", UserBulkActionView.as_view(), name="admin_user_bulk"),
    path(
        "users/<str:username>/details/",
        UserDetailsView.as_view(),
        name="admin_user_details",
    ),
    path(
        "users/<str:username>/role/",
        UserRoleUpdateView.as_view(),
        name="admin_user_role",
    ),
    path(
        "users/<str:username>/notes/",
        UserNotesView.as_view(),
        name="admin_user_notes",
    ),
    path(
        "users/<str:username>/toggle-block/",
        UserBlockToggleView.as_view(),
        name="admin_toggle_block_user",
    ),
    path(
        "users/<str:username>/delete/",
        UserDeleteView.as_view(),
        name="admin_delete_user",
    ),
    path(
        "system/integrity/",
        SystemIntegrityView.as_view(),
        name="admin_system_integrity",
    ),
    path("system/health/", SystemHealthView.as_view(), name="admin_system_health"),
    path("reports/", AdminReportsView.as_view(), name="admin_reports"),
    path(
        "reports/<int:report_id>/",
        AdminReportDetailView.as_view(),
        name="admin_report_detail",
    ),
    path(
        "store/items/<int:item_id>/duplicate/",
        StoreItemDuplicateView.as_view(),
        name="admin_store_item_duplicate",
    ),
]
