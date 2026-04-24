from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0006_storeitem_featured"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="purchase",
            index=models.Index(
                fields=["user", "item"], name="store_purch_user_id_145506_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="purchase",
            index=models.Index(
                fields=["user", "-purchased_at"],
                name="store_purch_user_id_853503_idx",
            ),
        ),
    ]
