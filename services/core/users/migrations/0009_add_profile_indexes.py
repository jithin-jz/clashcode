from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0008_remove_userprofile_github_username_and_more"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="userprofile",
            index=models.Index(fields=["-xp"], name="users_userp_xp_6f1f29_idx"),
        ),
        migrations.AddIndex(
            model_name="userprofile",
            index=models.Index(
                fields=["provider"], name="users_userp_provide_5ca5fe_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="userfollow",
            index=models.Index(
                fields=["following", "follower"],
                name="users_userf_followi_1f0cff_idx",
            ),
        ),
    ]
