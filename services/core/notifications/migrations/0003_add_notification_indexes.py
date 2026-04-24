from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("notifications", "0002_fcmtoken"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(
                fields=["recipient", "-created_at"],
                name="notificatio_recipie_452e95_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(
                fields=["recipient", "is_read", "-created_at"],
                name="notificatio_recipie_26c92a_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="fcmtoken",
            index=models.Index(
                fields=["user", "-updated_at"],
                name="notifications_user_id_2085dc_idx",
            ),
        ),
    ]
