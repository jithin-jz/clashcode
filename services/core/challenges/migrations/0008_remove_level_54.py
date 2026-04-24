from django.db import migrations


def remove_level_54(apps, _schema_editor):
    Challenge = apps.get_model("challenges", "Challenge")
    # Delete any challenge with order 54 or slug containing "level-54"
    Challenge.objects.filter(order=54).delete()
    Challenge.objects.filter(slug__icontains="level-54").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("challenges", "0007_usercertificate"),
    ]

    operations = [
        migrations.RunPython(remove_level_54),
    ]
