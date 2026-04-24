import csv
import uuid
from io import StringIO
from datetime import datetime, time, timedelta

from django.contrib.auth.models import User
from django.core.cache import cache
from django.http import HttpResponse
from django.core.paginator import Paginator
from django.db import models
from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDay
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    inline_serializer,
)
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from challenges.models import Challenge, UserProgress
from notifications.models import Notification
from store.models import StoreItem
from store.models import Purchase
from users.models import UserProfile
from users.serializers import UserSerializer

from .models import AdminAuditLog, AdminNote, AdminReport
from .permissions import IsAdminUser, can_manage_user
from .serializers import (
    AdminAuditLogSerializer,
    AdminNoteSerializer,
    AdminReportSerializer,
    AdminStatsSerializer,
    ChallengeAnalyticsSerializer,
    StoreAnalyticsSerializer,
    SystemIntegritySerializer,
    UserEngagementAnalyticsSerializer,
    UltimateAnalyticsSerializer,
)

ANALYTICS_CACHE_TTL = 60 * 2


def _request_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _request_id(request):
    return request.headers.get("X-Request-ID") or str(uuid.uuid4())


def _parse_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in {"1", "true", "yes", "on"}
    return False


def _parse_int(value, default, min_value=None, max_value=None):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    if min_value is not None:
        parsed = max(min_value, parsed)
    if max_value is not None:
        parsed = min(max_value, parsed)
    return parsed


def _parse_datetime_filter(value, end_of_day=False):
    if not value:
        return None

    dt = parse_datetime(value)
    if dt:
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt, timezone.get_current_timezone())
        return dt

    d = parse_date(value)
    if not d:
        return None

    if end_of_day:
        dt = datetime.combine(d, time.max).replace(microsecond=0)
    else:
        dt = datetime.combine(d, time.min)
    return timezone.make_aware(dt, timezone.get_current_timezone())


def _analytics_cache_key(prefix, request):
    return f"admin_analytics:{prefix}:{request.get_full_path()}"


def log_admin_action(admin, action, request=None, target_user=None, details=None):
    """Helper to record administrative actions in the audit log."""
    AdminAuditLog.objects.create(
        admin=admin,
        admin_username=admin.username if admin else "system",
        action=action,
        target_user=target_user,
        target_username=target_user.username if target_user else "",
        target_email=target_user.email if target_user else "",
        details=details or {},
        actor_ip=_request_ip(request) if request else None,
        user_agent=(request.headers.get("User-Agent", "")[:512] if request else ""),
        request_id=_request_id(request) if request else "",
    )


def _role_for_user(user):
    if user.is_superuser:
        return "superuser"
    if user.is_staff:
        return "staff"
    return "user"


class AdminStatsView(APIView):
    """View to get admin dashboard statistics."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={
            200: AdminStatsSerializer,
            403: OpenApiTypes.OBJECT,
        },
        description="Get administration statistics including total users, active sessions, and economy totals.",
    )
    def get(self, request):
        cache_key = _analytics_cache_key("stats", request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        total_users = User.objects.count()
        yesterday = timezone.now() - timedelta(days=1)
        active_sessions = User.objects.filter(last_login__gte=yesterday).count()
        oauth_logins = UserProfile.objects.exclude(
            provider__in=["email", "local"]
        ).count()
        total_xp = UserProfile.objects.aggregate(total_xp=Sum("xp"))["total_xp"] or 0

        data = {
            "total_users": total_users,
            "active_sessions": active_sessions,
            "oauth_logins": oauth_logins,
            "total_gems": total_xp,
        }
        serializer = AdminStatsSerializer(data)
        cache.set(cache_key, serializer.data, timeout=ANALYTICS_CACHE_TTL)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(APIView):
    """View to list all users for admin."""

    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter("search", str, OpenApiParameter.QUERY),
            OpenApiParameter(
                "role", str, OpenApiParameter.QUERY, enum=["user", "staff", "superuser"]
            ),
            OpenApiParameter(
                "status", str, OpenApiParameter.QUERY, enum=["active", "blocked"]
            ),
            OpenApiParameter("page", int, OpenApiParameter.QUERY, default=1),
            OpenApiParameter("page_size", int, OpenApiParameter.QUERY, default=25),
        ],
        responses={
            200: inline_serializer(
                name="AdminUserListResponse",
                fields={
                    "count": serializers.IntegerField(),
                    "page": serializers.IntegerField(),
                    "page_size": serializers.IntegerField(),
                    "total_pages": serializers.IntegerField(),
                    "results": UserSerializer(many=True),
                },
            ),
            403: OpenApiTypes.OBJECT,
        },
        description="List all users with filtering and pagination. Staff can see all non-staff/superuser users; Superusers can see everyone.",
    )
    def get(self, request):
        users = User.objects.select_related("profile").annotate(
            followers_total=Count("followers", distinct=True),
            following_total=Count("following", distinct=True),
        )
        if not request.user.is_superuser:
            users = users.filter(is_staff=False, is_superuser=False)

        search = (request.query_params.get("search") or "").strip()
        role = (request.query_params.get("role") or "").strip().lower()
        status_filter = (request.query_params.get("status") or "").strip().lower()
        page = _parse_int(request.query_params.get("page"), 1, min_value=1)
        page_size = _parse_int(
            request.query_params.get("page_size"), 25, min_value=1, max_value=100
        )

        if search:
            users = users.filter(
                models.Q(username__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(first_name__icontains=search)
                | models.Q(last_name__icontains=search)
            )

        if role == "user":
            users = users.filter(is_staff=False, is_superuser=False)
        elif role == "staff":
            users = users.filter(is_staff=True, is_superuser=False)
        elif role == "superuser":
            users = users.filter(is_superuser=True)

        if status_filter == "active":
            users = users.filter(is_active=True)
        elif status_filter == "blocked":
            users = users.filter(is_active=False)

        users = users.order_by("-date_joined", "id")

        paginator = Paginator(users, page_size)
        page_obj = paginator.get_page(page)
        serialized = UserSerializer(
            page_obj.object_list, many=True, context={"request": request}
        ).data

        return Response(
            {
                "count": paginator.count,
                "page": page_obj.number,
                "page_size": page_size,
                "total_pages": paginator.num_pages,
                "results": serialized,
            },
            status=status.HTTP_200_OK,
        )


class UserBlockToggleView(APIView):
    """View to toggle user active status."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        request=inline_serializer(
            name="UserBlockRequest",
            fields={"reason": serializers.CharField(required=False)},
        ),
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        description="Toggle a user's active status. Blocking a user prevents them from logging in.",
    )
    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        allowed, message = can_manage_user(request.user, user)
        if not allowed:
            return Response({"error": message}, status=status.HTTP_403_FORBIDDEN)

        reason = (request.data.get("reason") or "").strip()
        new_is_active = not user.is_active

        if user.is_superuser and not new_is_active:
            active_superusers = User.objects.filter(
                is_superuser=True, is_active=True
            ).count()
            if active_superusers <= 1:
                return Response(
                    {"error": "Cannot block the last active superuser account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        previous_is_active = user.is_active
        user.is_active = new_is_active
        user.save(update_fields=["is_active"])

        log_admin_action(
            admin=request.user,
            action="TOGGLE_USER_BLOCK",
            target_user=user,
            request=request,
            details={
                "before": {"is_active": previous_is_active},
                "after": {"is_active": user.is_active},
                "reason": reason,
            },
        )

        return Response(
            {
                "message": f"User {'unblocked' if user.is_active else 'blocked'} successfully",
                "is_active": user.is_active,
            },
            status=status.HTTP_200_OK,
        )


class UserDeleteView(APIView):
    """View to delete a user account."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        parameters=[OpenApiParameter("reason", str, OpenApiParameter.QUERY)],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        description="Permanently delete a user account. This action cannot be undone.",
    )
    def delete(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        allowed, message = can_manage_user(request.user, user)
        if not allowed:
            return Response({"error": message}, status=status.HTTP_403_FORBIDDEN)

        if user.is_superuser:
            superuser_count = User.objects.filter(is_superuser=True).count()
            if superuser_count <= 1:
                return Response(
                    {"error": "Cannot delete the last superuser account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reason = (request.query_params.get("reason") or "").strip()
        target_email = user.email

        log_admin_action(
            admin=request.user,
            action="DELETE_USER",
            target_user=user,
            request=request,
            details={"username": username, "email": target_email, "reason": reason},
        )

        user.delete()
        return Response(
            {"message": f"User {username} deleted successfully"},
            status=status.HTTP_200_OK,
        )


class UserDetailsView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={
            200: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        description="Retrieve an admin drill-down view of a user including profile, challenge progress, purchases, notes, reports, and recent audit activity.",
    )
    def get(self, request, username):
        try:
            target = User.objects.select_related("profile").get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_superuser and (target.is_staff or target.is_superuser):
            return Response(
                {"error": "Only superusers can inspect staff or superuser accounts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_data = UserSerializer(target, context={"request": request}).data
        progress_qs = UserProgress.objects.filter(user=target).select_related(
            "challenge"
        )
        completed_qs = progress_qs.filter(status=UserProgress.Status.COMPLETED)
        purchases = (
            Purchase.objects.filter(user=target)
            .select_related("item")
            .order_by("-purchased_at")[:8]
        )
        recent_logs = AdminAuditLog.objects.filter(
            models.Q(target_user=target) | models.Q(target_username=target.username)
        )[:8]
        notes = AdminNote.objects.filter(target_user=target)[:8]
        reports = AdminReport.objects.filter(target_user=target)[:8]

        avg_completion_time = (
            completed_qs.exclude(started_at__isnull=True, completed_at__isnull=True)
            .annotate(
                duration=models.ExpressionWrapper(
                    models.F("completed_at") - models.F("started_at"),
                    output_field=models.DurationField(),
                )
            )
            .aggregate(avg=Avg("duration"))
            .get("avg")
        )
        avg_seconds = (
            avg_completion_time.total_seconds()
            if avg_completion_time is not None
            else 0
        )

        recent_completions = []
        for row in completed_qs.order_by("-completed_at")[:6]:
            recent_completions.append(
                {
                    "challenge": row.challenge.title,
                    "stars": row.stars,
                    "completed_at": (
                        row.completed_at.isoformat() if row.completed_at else None
                    ),
                }
            )

        purchase_rows = [
            {
                "id": purchase.item.id,
                "name": purchase.item.name,
                "category": purchase.item.category,
                "cost": purchase.item.cost,
                "purchased_at": purchase.purchased_at.isoformat(),
            }
            for purchase in purchases
        ]

        return Response(
            {
                "user": user_data,
                "role": _role_for_user(target),
                "summary": {
                    "joined_at": target.date_joined.isoformat(),
                    "last_login": (
                        target.last_login.isoformat() if target.last_login else None
                    ),
                    "completed_challenges": completed_qs.count(),
                    "unlocked_challenges": progress_qs.exclude(
                        status=UserProgress.Status.LOCKED
                    ).count(),
                    "total_attempts": progress_qs.count(),
                    "avg_completion_time_seconds": avg_seconds,
                    "purchase_count": Purchase.objects.filter(user=target).count(),
                    "open_reports": AdminReport.objects.filter(target_user=target)
                    .exclude(status=AdminReport.Status.RESOLVED)
                    .count(),
                },
                "recent_completions": recent_completions,
                "recent_purchases": purchase_rows,
                "notes": AdminNoteSerializer(notes, many=True).data,
                "reports": AdminReportSerializer(reports, many=True).data,
                "audit_logs": AdminAuditLogSerializer(recent_logs, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class UserRoleUpdateView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        request=inline_serializer(
            name="AdminUserRoleUpdateRequest",
            fields={
                "role": serializers.ChoiceField(choices=["user", "staff", "superuser"])
            },
        ),
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
        },
        description="Update a user's role. Only superusers may promote users to staff or superuser.",
    )
    def patch(self, request, username):
        try:
            target = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        role = (request.data.get("role") or "").strip().lower()
        if role not in {"user", "staff", "superuser"}:
            return Response(
                {"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST
            )

        if request.user == target:
            return Response(
                {"error": "You cannot change your own role from the admin panel."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.is_superuser:
            return Response(
                {"error": "Only superusers can update user roles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        previous_role = _role_for_user(target)
        target.is_superuser = role == "superuser"
        target.is_staff = role in {"staff", "superuser"}
        target.save(update_fields=["is_staff", "is_superuser"])

        log_admin_action(
            admin=request.user,
            action="UPDATE_USER_ROLE",
            target_user=target,
            request=request,
            details={"before": previous_role, "after": role},
        )

        return Response(
            {
                "message": f"Updated {target.username} role to {role}.",
                "role": role,
            },
            status=status.HTTP_200_OK,
        )


class UserBulkActionView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        request=inline_serializer(
            name="AdminBulkUserActionRequest",
            fields={
                "action": serializers.ChoiceField(choices=["block", "unblock"]),
                "usernames": serializers.ListField(child=serializers.CharField()),
            },
        ),
        responses={200: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT},
        description="Perform block or unblock actions on multiple users in one request.",
    )
    def post(self, request):
        action = (request.data.get("action") or "").strip().lower()
        usernames = request.data.get("usernames") or []
        if action not in {"block", "unblock"} or not isinstance(usernames, list):
            return Response(
                {"error": "Invalid bulk action payload."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        changed = []
        skipped = []
        target_state = action == "unblock"
        for user in User.objects.filter(username__in=usernames):
            allowed, message = can_manage_user(request.user, user)
            if not allowed:
                skipped.append({"username": user.username, "reason": message})
                continue
            if user.is_superuser and not target_state:
                active_superusers = User.objects.filter(
                    is_superuser=True, is_active=True
                ).exclude(id=user.id)
                if not active_superusers.exists():
                    skipped.append(
                        {
                            "username": user.username,
                            "reason": "Cannot block the last active superuser account.",
                        }
                    )
                    continue
            if user.is_active == target_state:
                skipped.append(
                    {"username": user.username, "reason": "No change needed."}
                )
                continue
            user.is_active = target_state
            user.save(update_fields=["is_active"])
            changed.append(user.username)
            log_admin_action(
                admin=request.user,
                action="BULK_USER_STATUS_UPDATE",
                target_user=user,
                request=request,
                details={"after": {"is_active": user.is_active}, "bulk_action": action},
            )

        return Response(
            {"updated": changed, "skipped": skipped, "action": action},
            status=status.HTTP_200_OK,
        )


class UserExportView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        parameters=[
            OpenApiParameter("search", str, OpenApiParameter.QUERY),
            OpenApiParameter("role", str, OpenApiParameter.QUERY),
            OpenApiParameter("status", str, OpenApiParameter.QUERY),
        ],
        responses={200: OpenApiTypes.BINARY},
        description="Export the current user list filters as CSV.",
    )
    def get(self, request):
        users = (
            User.objects.select_related("profile").all().order_by("-date_joined", "id")
        )
        if not request.user.is_superuser:
            users = users.filter(is_staff=False, is_superuser=False)

        search = (request.query_params.get("search") or "").strip()
        role = (request.query_params.get("role") or "").strip().lower()
        status_filter = (request.query_params.get("status") or "").strip().lower()

        if search:
            users = users.filter(
                models.Q(username__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(first_name__icontains=search)
                | models.Q(last_name__icontains=search)
            )
        if role == "user":
            users = users.filter(is_staff=False, is_superuser=False)
        elif role == "staff":
            users = users.filter(is_staff=True, is_superuser=False)
        elif role == "superuser":
            users = users.filter(is_superuser=True)
        if status_filter == "active":
            users = users.filter(is_active=True)
        elif status_filter == "blocked":
            users = users.filter(is_active=False)

        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            [
                "username",
                "email",
                "role",
                "status",
                "xp",
                "joined_at",
                "last_login",
            ]
        )
        for user in users:
            writer.writerow(
                [
                    user.username,
                    user.email,
                    _role_for_user(user),
                    "active" if user.is_active else "blocked",
                    getattr(getattr(user, "profile", None), "xp", 0),
                    user.date_joined.isoformat(),
                    user.last_login.isoformat() if user.last_login else "",
                ]
            )

        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="admin-users.csv"'
        return response


class UserNotesView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        request=inline_serializer(
            name="AdminNoteRequest",
            fields={
                "body": serializers.CharField(max_length=2000),
                "is_pinned": serializers.BooleanField(required=False, default=False),
            },
        ),
        responses={200: AdminNoteSerializer(many=True), 201: AdminNoteSerializer},
        description="List or create internal admin notes for a user.",
    )
    def get(self, request, username):
        notes = AdminNote.objects.filter(target_user__username=username)
        return Response(
            AdminNoteSerializer(notes, many=True).data, status=status.HTTP_200_OK
        )

    def post(self, request, username):
        try:
            target = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        body = (request.data.get("body") or "").strip()
        if not body:
            return Response(
                {"error": "Note body is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        note = AdminNote.objects.create(
            admin=request.user,
            target_user=target,
            body=body,
            is_pinned=_parse_bool(request.data.get("is_pinned", False)),
        )
        log_admin_action(
            admin=request.user,
            action="CREATE_ADMIN_NOTE",
            target_user=target,
            request=request,
            details={"note_id": note.id, "is_pinned": note.is_pinned},
        )
        return Response(AdminNoteSerializer(note).data, status=status.HTTP_201_CREATED)


class AdminReportsView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        request=inline_serializer(
            name="AdminReportCreateRequest",
            fields={
                "target": serializers.CharField(),
                "title": serializers.CharField(max_length=200),
                "summary": serializers.CharField(max_length=2000),
                "category": serializers.CharField(required=False),
                "priority": serializers.ChoiceField(
                    choices=[choice for choice, _ in AdminReport.Priority.choices],
                    required=False,
                ),
            },
        ),
        responses={200: AdminReportSerializer(many=True), 201: AdminReportSerializer},
        description="List reports queue or create a new admin report.",
    )
    def get(self, request):
        qs = AdminReport.objects.select_related(
            "target_user", "created_by", "resolved_by"
        )
        status_filter = (request.query_params.get("status") or "").strip().upper()
        priority = (request.query_params.get("priority") or "").strip().upper()
        target = (request.query_params.get("target") or "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        if priority:
            qs = qs.filter(priority=priority)
        if target:
            qs = qs.filter(target_user__username__icontains=target)
        return Response(
            AdminReportSerializer(qs[:100], many=True).data, status=status.HTTP_200_OK
        )

    def post(self, request):
        target_username = (request.data.get("target") or "").strip()
        try:
            target = User.objects.get(username=target_username)
        except User.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )

        title = (request.data.get("title") or "").strip()
        summary = (request.data.get("summary") or "").strip()
        if not title or not summary:
            return Response(
                {"error": "Title and summary are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = AdminReport.objects.create(
            target_user=target,
            created_by=request.user,
            title=title,
            summary=summary,
            category=(request.data.get("category") or "GENERAL").strip() or "GENERAL",
            priority=(request.data.get("priority") or AdminReport.Priority.MEDIUM)
            .strip()
            .upper(),
            context=request.data.get("context") or {},
        )
        log_admin_action(
            admin=request.user,
            action="CREATE_ADMIN_REPORT",
            target_user=target,
            request=request,
            details={"report_id": report.id, "priority": report.priority},
        )
        return Response(
            AdminReportSerializer(report).data, status=status.HTTP_201_CREATED
        )


class AdminReportDetailView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        request=inline_serializer(
            name="AdminReportUpdateRequest",
            fields={
                "status": serializers.ChoiceField(
                    choices=[choice for choice, _ in AdminReport.Status.choices],
                    required=False,
                ),
                "priority": serializers.ChoiceField(
                    choices=[choice for choice, _ in AdminReport.Priority.choices],
                    required=False,
                ),
                "summary": serializers.CharField(max_length=2000, required=False),
            },
        ),
        responses={200: AdminReportSerializer},
        description="Update a report queue item.",
    )
    def patch(self, request, report_id):
        report = (
            AdminReport.objects.select_related("target_user")
            .filter(id=report_id)
            .first()
        )
        if not report:
            return Response(
                {"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if "status" in request.data:
            report.status = request.data.get("status")
            if report.status == AdminReport.Status.RESOLVED:
                report.resolved_at = timezone.now()
                report.resolved_by = request.user
        if "priority" in request.data:
            report.priority = request.data.get("priority")
        if "summary" in request.data:
            report.summary = request.data.get("summary")
        report.save()

        log_admin_action(
            admin=request.user,
            action="UPDATE_ADMIN_REPORT",
            target_user=report.target_user,
            request=request,
            details={
                "report_id": report.id,
                "status": report.status,
                "priority": report.priority,
            },
        )
        return Response(AdminReportSerializer(report).data, status=status.HTTP_200_OK)


class ChallengeAnalyticsView(APIView):
    """View to get detailed challenge performance analytics."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: ChallengeAnalyticsSerializer(many=True)},
        description="Get detailed challenge performance analytics including completion rates and average stars.",
    )
    def get(self, request):
        cache_key = _analytics_cache_key("challenge-analytics", request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        challenges = Challenge.objects.all()
        progress_summary = UserProgress.objects.values("challenge_id").annotate(
            total_attempts=Count("id"),
            completions=Count(
                "id",
                filter=models.Q(status=UserProgress.Status.COMPLETED),
            ),
            unlocked=Count(
                "id",
                filter=models.Q(status=UserProgress.Status.UNLOCKED),
            ),
            avg_stars=Avg(
                "stars",
                filter=models.Q(status=UserProgress.Status.COMPLETED),
            ),
            avg_duration=Avg(
                models.ExpressionWrapper(
                    models.F("completed_at") - models.F("started_at"),
                    output_field=models.DurationField(),
                ),
                filter=models.Q(
                    status=UserProgress.Status.COMPLETED,
                    started_at__isnull=False,
                    completed_at__isnull=False,
                ),
            ),
        )
        summary_map = {row["challenge_id"]: row for row in progress_summary}
        analytics_data = []

        for challenge in challenges:
            summary = summary_map.get(challenge.id, {})
            total_attempts = summary.get("total_attempts", 0)
            completions = summary.get("completions", 0)
            unlocked = summary.get("unlocked", 0)
            avg_stars = summary.get("avg_stars") or 0
            avg_duration = summary.get("avg_duration")
            avg_seconds = avg_duration.total_seconds() if avg_duration else 0
            abandoned = max(unlocked - completions, 0)

            analytics_data.append(
                {
                    "id": challenge.id,
                    "title": challenge.title,
                    "attempts": total_attempts,
                    "completions": completions,
                    "completion_rate": (
                        (completions / total_attempts * 100)
                        if total_attempts > 0
                        else 0
                    ),
                    "abandonment_rate": (
                        (abandoned / total_attempts * 100) if total_attempts > 0 else 0
                    ),
                    "average_time_seconds": avg_seconds,
                    "avg_stars": avg_stars,
                    "is_personalized": challenge.created_for_user is not None,
                }
            )

        serializer = ChallengeAnalyticsSerializer(analytics_data, many=True)
        cache.set(cache_key, serializer.data, timeout=ANALYTICS_CACHE_TTL)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StoreAnalyticsView(APIView):
    """View to get store economy and item popularity."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: StoreAnalyticsSerializer},
        description="Get store economy analytics, item popularity, and total XP revenue.",
    )
    def get(self, request):
        cache_key = _analytics_cache_key("store-analytics", request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        items = StoreItem.objects.annotate(purchase_count=Count("purchases")).order_by(
            "-purchase_count"
        )

        item_stats = [
            {
                "name": item.name,
                "category": item.category,
                "cost": item.cost,
                "sales": item.purchase_count,
                "revenue": item.purchase_count * item.cost,
            }
            for item in items
        ]

        total_revenue = sum(item["revenue"] for item in item_stats)
        data = {"items": item_stats, "total_xp_spent": total_revenue}
        serializer = StoreAnalyticsSerializer(data)
        cache.set(cache_key, serializer.data, timeout=ANALYTICS_CACHE_TTL)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserEngagementAnalyticsView(APIView):
    """View to get user engagement and growth analytics."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: UserEngagementAnalyticsSerializer},
        description="Get user growth trends, active session counts, and auth provider distribution.",
    )
    def get(self, request):
        cache_key = _analytics_cache_key("user-engagement", request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # 1. Daily Growth
        growth_qs = (
            User.objects.filter(date_joined__gte=thirty_days_ago)
            .annotate(day=TruncDay("date_joined"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        daily_growth = [
            {"date": item["day"].strftime("%Y-%m-%d"), "count": item["count"]}
            for item in growth_qs
        ]

        # 2. Active Users (last 24h)
        active_24h = User.objects.filter(
            last_login__gte=now - timedelta(days=1)
        ).count()

        # 3. Auth Provider Distribution
        auth_dist_qs = UserProfile.objects.values("provider").annotate(
            count=Count("user_id")
        )
        auth_distribution = [
            {"provider": item["provider"] or "email", "count": item["count"]}
            for item in auth_dist_qs
        ]

        # 4. Top Users by XP
        top_profiles = (
            UserProfile.objects.select_related("user")
            .annotate(followers_count=Count("user__followers", distinct=True))
            .order_by("-xp")[:10]
        )
        top_users = []
        for p in top_profiles:
            top_users.append(
                {
                    "username": p.user.username,
                    "xp": p.xp,
                    "followers": p.followers_count,
                }
            )

        data = {
            "daily_growth": daily_growth,
            "active_users_24h": active_24h,
            "auth_distribution": auth_distribution,
            "top_users": top_users,
        }
        serializer = UserEngagementAnalyticsSerializer(data)
        cache.set(cache_key, serializer.data, timeout=ANALYTICS_CACHE_TTL)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UltimateAnalyticsView(APIView):
    """Unified command center view for all system analytics."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: UltimateAnalyticsSerializer},
        description="Consolidated analytics including growth, economy, and performance leaderboards.",
    )
    def get(self, request):
        cache_key = _analytics_cache_key("ultimate", request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        now = timezone.now()
        thirty_ago = now - timedelta(days=30)

        # 1. Overview Stats
        overview = {
            "total_users": User.objects.count(),
            "active_24h": User.objects.filter(
                last_login__gte=now - timedelta(days=1)
            ).count(),
            "total_challenges": Challenge.objects.count(),
            "store_catalog": StoreItem.objects.filter(is_active=True).count(),
        }

        # 2. Growth Trends (Daily Registrations - Backfilled)
        growth_qs = (
            User.objects.filter(date_joined__gte=thirty_ago)
            .annotate(day=TruncDay("date_joined"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        growth_map = {item["day"].date(): item["count"] for item in growth_qs}

        growth_trends = []
        for i in range(31):
            day = (thirty_ago + timedelta(days=i)).date()
            if day > now.date():
                break
            growth_trends.append(
                {"date": day.strftime("%Y-%m-%d"), "count": growth_map.get(day, 0)}
            )

        # 3. Economy Pulse
        total_circulation_xp = (
            UserProfile.objects.aggregate(total=Sum("xp"))["total"] or 0
        )
        store_items = StoreItem.objects.annotate(sales=Count("purchases"))
        total_revenue = sum(item.sales * item.cost for item in store_items)

        economy_pulse = {
            "total_circulation_xp": total_circulation_xp,
            "total_store_revenue": total_revenue,
            "avg_xp_per_user": (
                (total_circulation_xp / overview["total_users"])
                if overview["total_users"] > 0
                else 0
            ),
        }

        # 4. Top Challenges (by completions)
        progress_summary = (
            UserProgress.objects.values("challenge_id")
            .annotate(
                attempts=Count("id"),
                completions=Count(
                    "id", filter=models.Q(status=UserProgress.Status.COMPLETED)
                ),
                unlocked=Count(
                    "id", filter=models.Q(status=UserProgress.Status.UNLOCKED)
                ),
                avg_stars=Avg(
                    "stars", filter=models.Q(status=UserProgress.Status.COMPLETED)
                ),
                avg_duration=Avg(
                    models.ExpressionWrapper(
                        models.F("completed_at") - models.F("started_at"),
                        output_field=models.DurationField(),
                    ),
                    filter=models.Q(
                        status=UserProgress.Status.COMPLETED,
                        started_at__isnull=False,
                        completed_at__isnull=False,
                    ),
                ),
            )
            .order_by("-completions")[:5]
        )

        challenge_ids = [row["challenge_id"] for row in progress_summary]
        challenges = {
            c.id: c.title for c in Challenge.objects.filter(id__in=challenge_ids)
        }

        top_challenges = [
            {
                "title": challenges.get(row["challenge_id"], "Unknown"),
                "attempts": row["attempts"],
                "completions": row["completions"],
                "abandonment_rate": (
                    max((row["unlocked"] or 0) - row["completions"], 0)
                    / row["attempts"]
                    * 100
                    if row["attempts"] > 0
                    else 0
                ),
                "average_time_seconds": (
                    row["avg_duration"].total_seconds()
                    if row.get("avg_duration") is not None
                    else 0
                ),
                "avg_stars": row["avg_stars"] or 0,
            }
            for row in progress_summary
        ]

        # 5. Top Items (by revenue)
        item_stats = [
            {"name": item.name, "revenue": item.sales * item.cost, "sales": item.sales}
            for item in store_items
        ]
        top_items = sorted(item_stats, key=lambda x: x["revenue"], reverse=True)[:5]

        # 6. Community Leaders
        top_profiles = (
            UserProfile.objects.select_related("user")
            .annotate(followers_count=Count("user__followers", distinct=True))
            .order_by("-xp")[:10]
        )
        community_leaders = [
            {
                "username": p.user.username,
                "xp": p.xp,
                "followers": p.followers_count,
            }
            for p in top_profiles
        ]

        last_broadcast = (
            AdminAuditLog.objects.filter(action="SEND_GLOBAL_NOTIFICATION")
            .order_by("-timestamp")
            .values_list("timestamp", flat=True)
            .first()
        )

        system_health = {
            "database": "online",
            "audit_pipeline": "active",
            "open_reports": AdminReport.objects.exclude(
                status=AdminReport.Status.RESOLVED
            ).count(),
            "pinned_notes": AdminNote.objects.filter(is_pinned=True).count(),
            "featured_store_items": StoreItem.objects.filter(featured=True).count(),
            "last_broadcast_at": last_broadcast.isoformat() if last_broadcast else None,
        }

        data = {
            "overview": overview,
            "growth_trends": growth_trends,
            "economy_pulse": economy_pulse,
            "top_challenges": top_challenges,
            "top_items": top_items,
            "community_leaders": community_leaders,
            "system_health": system_health,
        }
        serializer = UltimateAnalyticsSerializer(data)
        cache.set(cache_key, serializer.data, timeout=ANALYTICS_CACHE_TTL)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GlobalNotificationView(APIView):
    """View to send notifications to all users."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        request=inline_serializer(
            name="GlobalNotificationRequest",
            fields={
                "message": serializers.CharField(max_length=500),
                "include_staff": serializers.BooleanField(default=False),
                "reason": serializers.CharField(required=False),
            },
        ),
        responses={200: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT},
        description="Broadcast a notification to all active users.",
    )
    def post(self, request):
        verb = request.data.get("message")
        if not verb:
            return Response(
                {"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if len(verb) > 500:
            return Response(
                {"error": "Message too long (max 500 characters)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        include_staff = _parse_bool(request.data.get("include_staff", False))
        users_qs = User.objects.filter(is_active=True).exclude(id=request.user.id)
        if not include_staff:
            users_qs = users_qs.filter(is_staff=False, is_superuser=False)

        recipient_ids = list(users_qs.values_list("id", flat=True))
        notifications = [
            Notification(recipient_id=user_id, actor=request.user, verb=verb)
            for user_id in recipient_ids
        ]
        Notification.objects.bulk_create(notifications, batch_size=1000)

        reason = (request.data.get("reason") or "").strip()
        log_admin_action(
            admin=request.user,
            action="SEND_GLOBAL_NOTIFICATION",
            request=request,
            details={
                "message": verb,
                "recipient_count": len(recipient_ids),
                "include_staff": include_staff,
                "reason": reason,
            },
        )

        return Response(
            {"message": f"Broadcast sent to {len(recipient_ids)} users"},
            status=status.HTTP_200_OK,
        )


class BroadcastHistoryView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT},
        description="Retrieve broadcast history from admin audit logs.",
    )
    def get(self, request):
        logs = AdminAuditLog.objects.filter(action="SEND_GLOBAL_NOTIFICATION").order_by(
            "-timestamp"
        )[:25]
        rows = []
        for log in logs:
            rows.append(
                {
                    "request_id": log.request_id,
                    "message": log.details.get("message", ""),
                    "recipient_count": log.details.get("recipient_count", 0),
                    "include_staff": log.details.get("include_staff", False),
                    "reason": log.details.get("reason", ""),
                    "timestamp": log.timestamp.isoformat(),
                    "admin": log.admin_username
                    or (log.admin.username if log.admin else "System"),
                }
            )
        return Response({"results": rows}, status=status.HTTP_200_OK)


class BroadcastResendView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
        description="Resend a previously sent broadcast by request id.",
    )
    def post(self, request, request_id):
        log = AdminAuditLog.objects.filter(
            action="SEND_GLOBAL_NOTIFICATION", request_id=request_id
        ).first()
        if not log:
            return Response(
                {"error": "Broadcast not found."}, status=status.HTTP_404_NOT_FOUND
            )

        verb = (log.details or {}).get("message")
        if not verb:
            return Response(
                {"error": "Broadcast message missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        include_staff = _parse_bool((log.details or {}).get("include_staff", False))
        users_qs = User.objects.filter(is_active=True).exclude(id=request.user.id)
        if not include_staff:
            users_qs = users_qs.filter(is_staff=False, is_superuser=False)
        recipient_ids = list(users_qs.values_list("id", flat=True))
        Notification.objects.bulk_create(
            [
                Notification(recipient_id=user_id, actor=request.user, verb=verb)
                for user_id in recipient_ids
            ],
            batch_size=1000,
        )
        log_admin_action(
            admin=request.user,
            action="RESEND_GLOBAL_NOTIFICATION",
            request=request,
            details={
                "message": verb,
                "recipient_count": len(recipient_ids),
                "source_request_id": request_id,
                "include_staff": include_staff,
            },
        )
        return Response(
            {"message": f"Broadcast resent to {len(recipient_ids)} users"},
            status=status.HTTP_200_OK,
        )


class AdminAuditLogView(APIView):
    """View to retrieve administrative action logs."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        parameters=[
            OpenApiParameter("action", str, OpenApiParameter.QUERY),
            OpenApiParameter("admin", str, OpenApiParameter.QUERY),
            OpenApiParameter("target", str, OpenApiParameter.QUERY),
            OpenApiParameter("search", str, OpenApiParameter.QUERY),
            OpenApiParameter(
                "ordering", str, OpenApiParameter.QUERY, default="-timestamp"
            ),
            OpenApiParameter("date_from", str, OpenApiParameter.QUERY),
            OpenApiParameter("date_to", str, OpenApiParameter.QUERY),
            OpenApiParameter("page", int, OpenApiParameter.QUERY, default=1),
            OpenApiParameter("page_size", int, OpenApiParameter.QUERY, default=50),
        ],
        responses={
            200: inline_serializer(
                name="AdminAuditLogResponse",
                fields={
                    "count": serializers.IntegerField(),
                    "page": serializers.IntegerField(),
                    "page_size": serializers.IntegerField(),
                    "total_pages": serializers.IntegerField(),
                    "results": AdminAuditLogSerializer(many=True),
                },
            )
        },
        description="Retrieve administrative action logs with advanced filtering and search.",
    )
    def get(self, request):
        logs = AdminAuditLog.objects.select_related("admin", "target_user").all()

        action = (request.query_params.get("action") or "").strip()
        admin_username = (request.query_params.get("admin") or "").strip()
        target_username = (request.query_params.get("target") or "").strip()
        search = (request.query_params.get("search") or "").strip()
        ordering = request.query_params.get("ordering", "-timestamp")

        date_from = _parse_datetime_filter(request.query_params.get("date_from"))
        date_to = _parse_datetime_filter(
            request.query_params.get("date_to"), end_of_day=True
        )

        limit = _parse_int(request.query_params.get("limit"), 50, 1, 500)
        offset = _parse_int(request.query_params.get("offset"), 0, 0, None)
        page_size = _parse_int(
            request.query_params.get("page_size"), limit, min_value=1, max_value=500
        )
        page = _parse_int(request.query_params.get("page"), 1, min_value=1)

        if "offset" in request.query_params or "limit" in request.query_params:
            page_size = limit
            page = (offset // max(limit, 1)) + 1

        if action:
            logs = logs.filter(action=action)
        if admin_username:
            logs = logs.filter(admin_username__icontains=admin_username)
        if target_username:
            logs = logs.filter(target_username__icontains=target_username)
        if search:
            logs = logs.filter(
                models.Q(action__icontains=search)
                | models.Q(admin_username__icontains=search)
                | models.Q(target_username__icontains=search)
                | models.Q(request_id__icontains=search)
            )
        if date_from:
            logs = logs.filter(timestamp__gte=date_from)
        if date_to:
            logs = logs.filter(timestamp__lte=date_to)

        allowed_ordering = {
            "timestamp",
            "-timestamp",
            "action",
            "-action",
            "admin_username",
            "-admin_username",
            "target_username",
            "-target_username",
        }
        if ordering not in allowed_ordering:
            ordering = "-timestamp"
        tie_breaker = "-id" if ordering.startswith("-") else "id"
        logs = logs.order_by(ordering, tie_breaker)

        if (request.query_params.get("format") or "").strip().lower() == "csv":
            buffer = StringIO()
            writer = csv.writer(buffer)
            writer.writerow(
                ["timestamp", "admin", "action", "target", "request_id", "details"]
            )
            for log in logs[:1000]:
                writer.writerow(
                    [
                        log.timestamp.isoformat(),
                        log.admin_username,
                        log.action,
                        log.target_username,
                        log.request_id,
                        log.details,
                    ]
                )
            response = HttpResponse(buffer.getvalue(), content_type="text/csv")
            response["Content-Disposition"] = (
                'attachment; filename="admin-audit-logs.csv"'
            )
            return response

        paginator = Paginator(logs, page_size)
        page_obj = paginator.get_page(page)
        serializer = AdminAuditLogSerializer(page_obj.object_list, many=True)
        return Response(
            {
                "count": paginator.count,
                "page": page_obj.number,
                "page_size": page_size,
                "total_pages": paginator.num_pages,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class SystemIntegrityView(APIView):
    """View to check core system health and counts."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: SystemIntegritySerializer},
        description="Get current collection counts for key system models.",
    )
    def get(self, request):
        cache_key = _analytics_cache_key("system-integrity", request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        data = {
            "users": User.objects.count(),
            "challenges": Challenge.objects.count(),
            "store_items": StoreItem.objects.count(),
            "notifications": Notification.objects.count(),
            "audit_logs": AdminAuditLog.objects.count(),
        }
        serializer = SystemIntegritySerializer(data)
        cache.set(cache_key, serializer.data, timeout=ANALYTICS_CACHE_TTL)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SystemHealthView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT},
        description="Get lightweight operational health data for the admin dashboard.",
    )
    def get(self, request):
        cache_key = _analytics_cache_key("system-health", request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        latest_audit = (
            AdminAuditLog.objects.order_by("-timestamp")
            .values_list("timestamp", flat=True)
            .first()
        )
        latest_broadcast = (
            AdminAuditLog.objects.filter(action="SEND_GLOBAL_NOTIFICATION")
            .order_by("-timestamp")
            .values_list("timestamp", flat=True)
            .first()
        )
        data = {
            "database": "online",
            "authentication": "online",
            "notifications": "online",
            "audit_pipeline": "active",
            "latest_audit_at": latest_audit.isoformat() if latest_audit else None,
            "latest_broadcast_at": (
                latest_broadcast.isoformat() if latest_broadcast else None
            ),
            "open_reports": AdminReport.objects.exclude(
                status=AdminReport.Status.RESOLVED
            ).count(),
        }
        cache.set(cache_key, data, timeout=ANALYTICS_CACHE_TTL)
        return Response(data, status=status.HTTP_200_OK)


class StoreItemDuplicateView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
        description="Duplicate an existing store item to speed up admin catalog management.",
    )
    def post(self, request, item_id):
        item = StoreItem.objects.filter(id=item_id).first()
        if not item:
            return Response(
                {"error": "Store item not found."}, status=status.HTTP_404_NOT_FOUND
            )

        duplicate = StoreItem.objects.create(
            name=f"{item.name} Copy",
            description=item.description,
            cost=item.cost,
            icon_name=item.icon_name,
            category=item.category,
            image=item.image,
            item_data=item.item_data,
            is_active=False,
            featured=False,
        )
        log_admin_action(
            admin=request.user,
            action="DUPLICATE_STORE_ITEM",
            request=request,
            details={"source_item_id": item.id, "duplicate_item_id": duplicate.id},
        )
        return Response(
            {"id": duplicate.id, "message": "Store item duplicated."},
            status=status.HTTP_200_OK,
        )
