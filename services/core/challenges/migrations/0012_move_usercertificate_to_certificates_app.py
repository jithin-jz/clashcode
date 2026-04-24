from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("certificates", "0001_initial"),
        ("challenges", "0011_remove_challenge_category_and_more"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[migrations.DeleteModel(name="UserCertificate")],
            database_operations=[],
        )
    ]
