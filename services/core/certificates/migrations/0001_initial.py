from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("challenges", "0011_remove_challenge_category_and_more"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name="UserCertificate",
                    fields=[
                        (
                            "id",
                            models.BigAutoField(
                                auto_created=True,
                                primary_key=True,
                                serialize=False,
                                verbose_name="ID",
                            ),
                        ),
                        (
                            "certificate_id",
                            models.UUIDField(
                                db_index=True,
                                default=uuid.uuid4,
                                editable=False,
                                unique=True,
                            ),
                        ),
                        ("issued_date", models.DateTimeField(auto_now_add=True)),
                        (
                            "certificate_image",
                            models.ImageField(
                                blank=True, null=True, upload_to="certificates/"
                            ),
                        ),
                        ("is_valid", models.BooleanField(default=True)),
                        (
                            "completion_count",
                            models.IntegerField(
                                help_text="Number of challenges completed when certificate was issued"
                            ),
                        ),
                        (
                            "user",
                            models.OneToOneField(
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="certificate",
                                to=settings.AUTH_USER_MODEL,
                            ),
                        ),
                    ],
                    options={
                        "ordering": ["-issued_date"],
                        "db_table": "challenges_usercertificate",
                    },
                ),
            ],
            database_operations=[],
        )
    ]
