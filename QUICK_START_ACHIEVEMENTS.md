# Quick Start Guide - Achievement System

## 🎮 For Users: How to Earn Achievements

### 📝 Review Achievements
| Action | Achievement | Icon |
|--------|-------------|------|
| Write 1 review | **First Steps** | ⭐ Gold |
| Write 5 reviews | **Review Enthusiast** | ⭐ Gold |
| Write 20 reviews | **Review Master** | ⭐ Gold |
| Write 50 reviews | **Review Legend** | ⭐ Gold |
| Give 10 five-star ratings | **Perfectionist** | 💜 Purple |

**How to:** Log tab → Search game → Write review → Submit

---

### 📋 List Achievements
| Action | Achievement | Icon |
|--------|-------------|------|
| Create 1 list | **List Starter** | 💚 Green |
| Create 5 lists | **List Creator** | 💚 Green |
| Create 10 lists | **List Master** | 🏆 Trophy |

**How to:** Lists tab → Create New List → Add games → Create

---

### 🎮 Library Achievements
| Action | Achievement | Icon |
|--------|-------------|------|
| Add 10 games | **Game Explorer** | 🎮 Cyan |
| Add 50 games | **Game Collector** | 🎮 Cyan |
| Add 100 games | **Game Enthusiast** | 🏆 Trophy |

**How to:** Game Detail → Add to Library button

---

### 🔥 Streak Achievements
| Action | Achievement | Icon |
|--------|-------------|------|
| 3-day activity | **Getting Started** | 🔥 Red |
| 7-day activity | **Streak Master** | 🔥 Red |
| 30-day activity | **Dedication Champion** | 👑 Crown |

**How to:** Use the app daily (write reviews, create lists, or add games)

---

## 👨‍💻 For Developers: Quick Integration Reference

### Import the Hook
```typescript
import { useAchievements } from '@/hooks/useAchievements';
```

### Use in Component
```typescript
const {
  trackReview,           // Track review submission
  trackListCreated,      // Track list creation
  trackListDeleted,      // Track list deletion
  trackGameAdded,        // Track game addition
  trackGameRemoved,      // Track game removal
  trackReviewDeleted,    // Track review deletion
} = useAchievements();
```

### Track Actions
```typescript
// When user writes a review
await trackReview(rating); // rating = 1-5

// When user creates a list
await trackListCreated();

// When user deletes a list
await trackListDeleted();

// When user adds game to library
await trackGameAdded();

// When user removes game from library
await trackGameRemoved();

// When user deletes a review
await trackReviewDeleted(rating);
```

---

## 🔍 Viewing Achievements

### In Profile Tab
1. Open **Profile** tab
2. See achievement count in header stats
3. Scroll to **"Recent Achievements"** section
4. View last 3 unlocked achievements

### Achievement Stats
- **Quick Stats**: Shows total counts at top
- **Gaming Overview**: 4 stat cards with current data
- **Recent Achievements**: Last 3 unlocked with badges
- **Stats Tab**: Detailed breakdown of all statistics

---

## 🧪 Testing Achievements

### Quick Test Script
```typescript
// Test 1: Write first review
1. Go to Log tab
2. Search "Elden Ring"
3. Select game
4. Rate 5 stars
5. Submit
✅ "First Steps" should unlock

// Test 2: Create first list
1. Go to Lists tab
2. Tap "Create New List"
3. Enter "My Favorites"
4. Add some games
5. Create
✅ "List Starter" should unlock

// Test 3: Add games to library
1. Go to Discover tab
2. Select any game
3. Tap "Add to Library"
4. Repeat 9 more times
✅ "Game Explorer" should unlock (10th game)
```

---

## 📱 User Experience Flow

### Achievement Unlock Flow
```
User Action
    ↓
System Tracks
    ↓
Check Requirements
    ↓
Unlock Achievement (if milestone reached)
    ↓
Show Notification
    ↓
Update Profile Stats
    ↓
Persist to Storage
```

### Notification Example
```
Alert appears:
━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 Achievement Unlocked!

First Steps
Write your first review

        [Awesome!]
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 💾 Data Storage

### What's Stored
- Achievement unlock status
- User statistics (reviews, lists, games)
- Activity streaks
- Unlock timestamps
- 5-star rating count

### Where It's Stored
- **Method**: AsyncStorage (local)
- **Keys**: 
  - `@achievements`
  - `@user_stats`
- **Format**: JSON
- **Persistence**: Survives app restarts

---

## 🐛 Troubleshooting

### Achievements Not Unlocking?
1. Check console for errors
2. Verify tracking function is called
3. Ensure milestone requirements are met
4. Check AsyncStorage has permissions

### Stats Not Updating?
1. Refresh Profile tab (pull to refresh)
2. Check if tracking functions are awaited
3. Verify state updates in components

### Notifications Not Showing?
1. Check Alert is imported from 'react-native'
2. Verify showAchievementNotification is called
3. Test on physical device (simulators may vary)

---

## 📊 Achievement Statistics

### Total Achievements: 15

**By Category:**
- 📝 Reviews: 5 achievements
- 📋 Lists: 3 achievements
- 🎮 Library: 3 achievements
- 🔥 Streaks: 3 achievements
- 💜 Special: 1 achievement (Perfectionist)

**By Difficulty:**
- Easy (1-5 actions): 5 achievements
- Medium (5-20 actions): 5 achievements
- Hard (20+ actions): 5 achievements

---

## 🎯 Achievement Roadmap

### Current (v1.0)
- ✅ 15 base achievements
- ✅ Activity tracking
- ✅ Notification system
- ✅ Profile integration
- ✅ Data persistence

### Planned (Future)
- ⏳ Social achievements
- ⏳ Time-based challenges
- ⏳ Genre-specific achievements
- ⏳ Cloud sync
- ⏳ Achievement sharing

---

## 📞 Support

### Issues?
1. Check INTEGRATION_COMPLETE.md for details
2. Review ACHIEVEMENT_SYSTEM.md for documentation
3. Check component implementations
4. Verify AsyncStorage permissions

### Need Help?
- Review code comments in achievementService.ts
- Check hook implementation in useAchievements.ts
- Test with Quick Test Script above

---

## ✨ Pro Tips

1. **Test on Real Device**: Notifications work best on physical devices
2. **Clear Storage for Testing**: Use resetAchievements() to start fresh
3. **Track Everything**: Call tracking functions for ALL user actions
4. **Await Async Calls**: Always await achievement tracking functions
5. **Check Console**: Monitor logs for achievement unlocks

---

**Happy Gaming! 🎮🏆**
