"""
Data migration to fix streak achievement target values.

Sets correct target_value for streak-based achievements:
- streak-starter: 3 consecutive days
- streak-master: 7 consecutive days
"""
from django.db import migrations


def fix_streak_achievement_targets(apps, schema_editor):
    """Fix target_value for streak achievements."""
    Achievement = apps.get_model('achievements', 'Achievement')
    
    # Fix streak-starter (should require 3 consecutive days)
    Achievement.objects.filter(slug='streak-starter').update(target_value=3)
    
    # Fix streak-master (should require 7 consecutive days)
    Achievement.objects.filter(slug='streak-master').update(target_value=7)


def reverse_fix(apps, schema_editor):
    """Reverse the migration (reset to default)."""
    Achievement = apps.get_model('achievements', 'Achievement')
    Achievement.objects.filter(slug__in=['streak-starter', 'streak-master']).update(target_value=1)


class Migration(migrations.Migration):

    dependencies = [
        ('achievements', '0002_achievement_target_value_userachievementprogress'),
    ]

    operations = [
        migrations.RunPython(fix_streak_achievement_targets, reverse_fix),
    ]
