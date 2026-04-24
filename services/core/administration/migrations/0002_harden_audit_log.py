from django.db import migrations, models
import django.db.models.deletion


def backfill_audit_snapshots(apps, _schema_editor):
    AdminAuditLog = apps.get_model("administration", "AdminAuditLog")
    for log in (
        AdminAuditLog.objects.select_related("admin", "target_user").all().iterator()
    ):
        changed = False
        if not log.admin_username and log.admin_id:
            log.admin_username = log.admin.username
            changed = True
        if not log.target_username and log.target_user_id:
            log.target_username = log.target_user.username
            changed = True
        if not log.target_email and log.target_user_id:
            log.target_email = log.target_user.email or ""
            changed = True
        if changed:
            log.save(
                update_fields=["admin_username", "target_username", "target_email"]
            )


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="adminauditlog",
            name="admin_username",
            field=models.CharField(default="", db_index=True, max_length=150),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="adminauditlog",
            name="target_username",
            field=models.CharField(
                blank=True, db_index=True, default="", max_length=150
            ),
        ),
        migrations.AddField(
            model_name="adminauditlog",
            name="target_email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.AddField(
            model_name="adminauditlog",
            name="actor_ip",
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="adminauditlog",
            name="user_agent",
            field=models.CharField(blank=True, default="", max_length=512),
        ),
        migrations.AddField(
            model_name="adminauditlog",
            name="request_id",
            field=models.CharField(
                blank=True, db_index=True, default="", max_length=64
            ),
        ),
        migrations.AlterField(
            model_name="adminauditlog",
            name="admin",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="admin_actions",
                to="auth.user",
            ),
        ),
        migrations.AlterField(
            model_name="adminauditlog",
            name="action",
            field=models.CharField(db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name="adminauditlog",
            name="timestamp",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.RunPython(backfill_audit_snapshots, migrations.RunPython.noop),
    ]
