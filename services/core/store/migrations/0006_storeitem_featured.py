from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0005_alter_storeitem_category"),
    ]

    operations = [
        migrations.AddField(
            model_name="storeitem",
            name="featured",
            field=models.BooleanField(default=False),
        ),
    ]
