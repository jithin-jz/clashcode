from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("challenges", "0012_move_usercertificate_to_certificates_app"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="userprogress",
            index=models.Index(
                fields=["user", "status"], name="challenge_u_user_id_047eb8_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="userprogress",
            index=models.Index(
                fields=["user", "completed_at"],
                name="challenge_u_user_id_70eb0f_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="userprogress",
            index=models.Index(
                fields=["challenge", "status"],
                name="challenge_u_challen_7805a8_idx",
            ),
        ),
    ]
