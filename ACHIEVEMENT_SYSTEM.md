# Achievement System Documentation

## Overview
The Achievement System automatically tracks user activities across the GameLog app and unlocks achievements based on specific milestones. This creates an engaging gamification layer that encourages user engagement.

---

## 📊 How Achievements Are Earned

### 1. **Review Achievements**
Users unlock these by writing game reviews:

| Achievement | Requirement | Reward |
|------------|-------------|---------|
| **First Steps** | Write 1 review | ⭐ Gold Badge |
| **Review Enthusiast** | Write 5 reviews | ⭐ Gold Badge |
| **Review Master** | Write 20 reviews | ⭐ Gold Badge |
| **Review Legend** | Write 50 reviews | ⭐ Gold Badge |
| **Perfectionist** | Give 10 games 5-star ratings | 💜 Purple Badge |

**When earned:** Automatically when user submits a review in the Log tab

---

### 2. **List Achievements**
Users unlock these by creating custom game lists:

| Achievement | Requirement | Reward |
|------------|-------------|---------|
| **List Starter** | Create 1 list | 💚 Green Badge |
| **List Creator** | Create 5 lists | 💚 Green Badge |
| **List Master** | Create 10 lists | 🏆 Trophy Badge |

**When earned:** Automatically when user creates a new list in Lists tab

---

### 3. **Gaming Achievements**
Users unlock these by adding games to their library:

| Achievement | Requirement | Reward |
|------------|-------------|---------|
| **Game Explorer** | Add 10 games to library | 🎮 Cyan Badge |
| **Game Collector** | Add 50 games to library | 🎮 Cyan Badge |
| **Game Enthusiast** | Add 100 games to library | 🏆 Trophy Badge |

**When earned:** Automatically when user adds games to their library

---

### 4. **Streak Achievements**
Users unlock these by maintaining activity streaks:

| Achievement | Requirement | Reward |
|------------|-------------|---------|
| **Getting Started** | 3-day activity streak | 🔥 Red Badge |
| **Streak Master** | 7-day activity streak | 🔥 Red Badge |
| **Dedication Champion** | 30-day activity streak | 👑 Crown Badge |

**When earned:** Automatically tracked daily when user performs any activity (review, list creation, or game addition)

**Note:** Streak continues if user is active on consecutive days, resets if a day is missed

---

## 🔧 Technical Implementation

### For Developers: Integrating Achievement Tracking

#### 1. **Import the hook**
```typescript
import { useAchievements } from '@/hooks/useAchievements';
```

#### 2. **Use in your component**
```typescript
const {
  trackReview,
  trackListCreated,
  trackGameAdded,
  trackReviewDeleted,
  trackListDeleted,
  trackGameRemoved,
} = useAchievements();
```

#### 3. **Track user actions**

**When user writes a review:**
```typescript
// In log screen or review submission
const handleSubmitReview = async (rating: number) => {
  // Save review to database...
  
  // Track achievement
  await trackReview(rating); // This will auto-unlock achievements
};
```

**When user creates a list:**
```typescript
const handleCreateList = async () => {
  // Create list logic...
  
  // Track achievement
  await trackListCreated();
};
```

**When user adds game to library:**
```typescript
const handleAddToLibrary = async () => {
  // Add to library logic...
  
  // Track achievement
  await trackGameAdded();
};
```

**When user deletes a review:**
```typescript
const handleDeleteReview = async (rating: number) => {
  // Delete review logic...
  
  // Track deletion (decrements count)
  await trackReviewDeleted(rating);
};
```

**When user deletes a list:**
```typescript
const handleDeleteList = async () => {
  // Delete list logic...
  
  // Track deletion
  await trackListDeleted();
};
```

**When user removes game from library:**
```typescript
const handleRemoveFromLibrary = async () => {
  // Remove from library logic...
  
  // Track removal
  await trackGameRemoved();
};
```

---

## 📱 User Experience Flow

### Achievement Unlock Flow:
1. **User performs action** (e.g., writes a review)
2. **System tracks action** (increments review count)
3. **System checks requirements** (has user reached milestone?)
4. **Achievement unlocks** (if requirements met)
5. **Notification appears** (Alert with achievement details)
6. **Achievement shows in profile** (appears in Recent Achievements)

### Example User Journey:
```
Day 1: User writes first review
  → ✅ "First Steps" unlocked
  → Shows notification: "🏆 Achievement Unlocked! First Steps"
  → Appears in Profile > Overview > Recent Achievements

Day 2: User creates first custom list
  → ✅ "List Starter" unlocked
  → ✅ "Getting Started" (3-day streak) in progress

Day 5: User writes 5th review
  → ✅ "Review Enthusiast" unlocked
  → Shows in profile as recent achievement
```

---

## 🎨 Profile Tab Integration

### Displaying Achievements in Profile:

The profile tab automatically shows:

1. **Achievement Count** in quick stats header
2. **Recent Achievements** (last 3 unlocked) in Overview tab
3. **Empty State** when no achievements unlocked yet

Achievement data is loaded from:
```typescript
const { getRecentAchievements, getUnlockedCount } = useAchievements();
```

---

## 💾 Data Persistence

All achievement data is stored locally using AsyncStorage:

- **Achievement states** (locked/unlocked)
- **User statistics** (review count, list count, etc.)
- **Streak tracking** (current/longest streak)
- **Unlock timestamps** (when each achievement was earned)

Data persists across app sessions and survives app restarts.

---

## 🎯 Future Enhancements

Potential additions to the achievement system:

1. **Social Achievements**
   - Share your first review
   - Like 50 reviews
   - Follow 10 users

2. **Time-Based Achievements**
   - Night Owl (review after midnight)
   - Early Bird (review before 6 AM)
   - Weekend Warrior (10 reviews on weekends)

3. **Genre-Specific Achievements**
   - RPG Master (review 20 RPG games)
   - Action Hero (review 20 action games)

4. **Advanced Achievements**
   - Critic (write reviews over 200 words)
   - Trending (have review liked by 100+ users)
   - Completionist (track 100% completion)

---

## 🧪 Testing Achievements

For testing purposes, you can reset all achievements:

```typescript
const { resetAchievements } = useAchievements();

// Reset everything to start fresh
await resetAchievements();
```

This resets:
- All achievements to locked state
- All user stats to zero
- Activity streaks to zero

---

## 📋 Summary

The achievement system works automatically in the background, tracking user activities and unlocking achievements when milestones are reached. Developers simply need to call the appropriate tracking function when users perform actions, and the system handles the rest:

✅ **Automatic tracking**
✅ **Smart milestone detection**
✅ **User notifications**
✅ **Profile integration**
✅ **Persistent storage**
✅ **Streak management**

No manual achievement management needed - the system is fully automated!
