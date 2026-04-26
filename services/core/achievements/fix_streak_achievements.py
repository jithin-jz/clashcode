"""
Quick fix script to update streak achievement target values in the database.

Run this script to fix the streak achievements that are unlocking incorrectly:
    python fix_streak_achievements.py
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from achievements.models import Achievement


def fix_streak_achievements():
    """Fix target_value for streak achievements."""
    print("🔧 Fixing streak achievement target values...")
    print()
    
    # Check current values
    achievements = Achievement.objects.filter(
        slug__in=['streak-starter', 'streak-master']
    )
    
    print("Current values:")
    for ach in achievements:
        print(f"  - {ach.slug}: target_value = {ach.target_value}")
    print()
    
    # Fix streak-starter
    starter = Achievement.objects.filter(slug='streak-starter').first()
    if starter:
        old_value = starter.target_value
        starter.target_value = 3
        starter.save()
        print(f"✅ streak-starter: {old_value} → 3")
    
    # Fix streak-master
    master = Achievement.objects.filter(slug='streak-master').first()
    if master:
        old_value = master.target_value
        master.target_value = 7
        master.save()
        print(f"✅ streak-master: {old_value} → 7")
    
    print()
    print("Verification:")
    achievements = Achievement.objects.filter(
        slug__in=['streak-starter', 'streak-master']
    )
    for ach in achievements:
        print(f"  - {ach.slug}: target_value = {ach.target_value} ✓")
    
    print()
    print("🎉 Streak achievements fixed!")
    print("   - Streak Starter will unlock after 3 consecutive days")
    print("   - Streak Master will unlock after 7 consecutive days")


if __name__ == '__main__':
    try:
        fix_streak_achievements()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
