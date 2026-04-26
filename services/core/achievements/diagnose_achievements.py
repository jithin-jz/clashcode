"""
Achievement System Diagnostic Script

This script checks the health of the achievement system and identifies any
achievements that may have been incorrectly unlocked.

Run with: python diagnose_achievements.py
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from achievements.models import Achievement, UserAchievement, UserAchievementProgress
from django.contrib.auth.models import User


def diagnose_achievements():
    """Run comprehensive diagnostic on achievement system."""
    print("=" * 80)
    print("🔍 ACHIEVEMENT SYSTEM DIAGNOSTIC")
    print("=" * 80)
    print()
    
    # 1. Check all achievements have correct target_value
    print("1️⃣  Checking achievement target values...")
    print("-" * 80)
    
    expected_targets = {
        'first-blood': 1,
        'rising-coder': 5,
        'challenge-veteran': 10,
        'legend': 25,
        'speed-demon': 1,
        'perfectionist': 1,
        'streak-starter': 3,
        'streak-master': 7,
        'socializer': 1,
        'networker': 10,
    }
    
    all_correct = True
    for slug, expected in expected_targets.items():
        achievement = Achievement.objects.filter(slug=slug).first()
        if not achievement:
            print(f"  ❌ {slug}: NOT FOUND in database")
            all_correct = False
        elif achievement.target_value != expected:
            print(f"  ❌ {slug}: target_value={achievement.target_value} (expected {expected})")
            all_correct = False
        else:
            print(f"  ✅ {slug}: target_value={achievement.target_value} ✓")
    
    if all_correct:
        print("\n  🎉 All target values are correct!")
    else:
        print("\n  ⚠️  Some target values are incorrect. Run: python manage.py migrate achievements")
    
    print()
    
    # 2. Check for potentially incorrectly unlocked achievements
    print("2️⃣  Checking for incorrectly unlocked achievements...")
    print("-" * 80)
    
    users = User.objects.all()
    issues_found = False
    
    for user in users:
        unlocked = UserAchievement.objects.filter(user=user).select_related('achievement')
        if not unlocked.exists():
            continue
        
        print(f"\n  User: {user.username}")
        for ua in unlocked:
            ach = ua.achievement
            progress = UserAchievementProgress.objects.filter(
                user=user, achievement=ach
            ).first()
            
            if progress:
                if progress.current_value < ach.target_value:
                    print(f"    ⚠️  {ach.slug}: unlocked with value={progress.current_value}/{ach.target_value}")
                    issues_found = True
                else:
                    print(f"    ✅ {ach.slug}: {progress.current_value}/{ach.target_value} (correctly unlocked)")
            else:
                print(f"    ⚠️  {ach.slug}: no progress record found")
                issues_found = True
    
    if not issues_found:
        print("\n  🎉 No incorrectly unlocked achievements found!")
    else:
        print("\n  ⚠️  Some achievements may have been incorrectly unlocked.")
        print("  Consider resetting progress for affected users.")
    
    print()
    
    # 3. Summary statistics
    print("3️⃣  System Statistics")
    print("-" * 80)
    print(f"  Total achievements defined: {Achievement.objects.count()}")
    print(f"  Total users: {users.count()}")
    print(f"  Total unlocks: {UserAchievement.objects.count()}")
    print(f"  Total progress records: {UserAchievementProgress.objects.count()}")
    print()
    
    # Achievement unlock distribution
    print("  Achievement unlock distribution:")
    for ach in Achievement.objects.all().order_by('order'):
        unlock_count = UserAchievement.objects.filter(achievement=ach).count()
        print(f"    {ach.slug:25} {unlock_count:3} users unlocked")
    
    print()
    print("=" * 80)
    print("✅ DIAGNOSTIC COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    try:
        diagnose_achievements()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
