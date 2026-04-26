"""
Data migration to fix ALL achievement target values.

Sets correct target_value for all achievements based on their requirements:
- first-blood: 1 challenge
- rising-coder: 5 challenges
- challenge-veteran: 10 challenges
- legend: 25 challenges
- speed-demon: 1 speed completion
- perfectionist: 1 three-star completion
- streak-starter: 3 consecutive days
- streak-master: 7 consecutive days
- socializer: 1 follow
- networker: 10 follows
"""
from django.db import migrations


def fix_all_achievement_targets(apps, schema_editor):
    """Fix target_value for all achievements."""
    Achievement = apps.get_model('achievements', 'Achievement')
    
    # Define correct target values for all achievements
    target_values = {
        'first-blood': 1,           # First challenge
        'rising-coder': 5,          # 5 challenges
        'challenge-veteran': 10,    # 10 challenges
        'legend': 25,               # 25 challenges
        'speed-demon': 1,           # One speed completion
        'perfectionist': 1,         # One 3-star completion
        'streak-starter': 3,        # 3 consecutive days
        'streak-master': 7,         # 7 consecutive days
        'socializer': 1,            # First follow
        'networker': 10,            # 10 follows
    }
    
    print("\n🔧 Fixing achievement target values...")
    for slug, target in target_values.items():
        updated = Achievement.objects.filter(slug=slug).update(target_value=target)
        if updated:
            print(f"  ✅ {slug}: target_value = {target}")
        else:
            print(f"  ⚠️  {slug}: not found in database")
    print()


def reverse_fix(apps, schema_editor):
    """Reverse the migration (reset to default)."""
    Achievement = apps.get_model('achievements', 'Achievement')
    Achievement.objects.update(target_value=1)


class Migration(migrations.Migration):

    dependencies = [
        ('achievements', '0003_fix_streak_achievement_targets'),
    ]

    operations = [
        migrations.RunPython(fix_all_achievement_targets, reverse_fix),
    ]
