import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Star,
  Trophy,
  Fire,
  Crown,
  GameController,
  ListBullets,
  Heart,
  Clock,
} from 'phosphor-react-native';

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'reviews' | 'gaming' | 'social' | 'dedication';
  requirement: {
    type: 'review_count' | 'list_count' | 'game_count' | 'streak_count' | 'rating_count';
    target: number;
  };
}

// All available achievements in the app
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Review Achievements
  {
    id: 'first_review',
    title: 'First Steps',
    description: 'Write your first review',
    icon: Star,
    color: '#F59E0B',
    unlocked: false,
    category: 'reviews',
    requirement: { type: 'review_count', target: 1 },
  },
  {
    id: 'review_master_5',
    title: 'Review Enthusiast',
    description: 'Write 5 reviews',
    icon: Star,
    color: '#F59E0B',
    unlocked: false,
    category: 'reviews',
    requirement: { type: 'review_count', target: 5 },
  },
  {
    id: 'review_master_20',
    title: 'Review Master',
    description: 'Write 20 reviews',
    icon: Star,
    color: '#F59E0B',
    unlocked: false,
    category: 'reviews',
    requirement: { type: 'review_count', target: 20 },
  },
  {
    id: 'review_master_50',
    title: 'Review Legend',
    description: 'Write 50 reviews',
    icon: Star,
    color: '#F59E0B',
    unlocked: false,
    category: 'reviews',
    requirement: { type: 'review_count', target: 50 },
  },

  // List Achievements
  {
    id: 'first_list',
    title: 'List Starter',
    description: 'Create your first custom list',
    icon: ListBullets,
    color: '#22C55E',
    unlocked: false,
    category: 'social',
    requirement: { type: 'list_count', target: 1 },
  },
  {
    id: 'list_creator',
    title: 'List Creator',
    description: 'Create 5 custom lists',
    icon: ListBullets,
    color: '#22C55E',
    unlocked: false,
    category: 'social',
    requirement: { type: 'list_count', target: 5 },
  },
  {
    id: 'list_master',
    title: 'List Master',
    description: 'Create 10 custom lists',
    icon: Trophy,
    color: '#22C55E',
    unlocked: false,
    category: 'social',
    requirement: { type: 'list_count', target: 10 },
  },

  // Gaming Achievements
  {
    id: 'game_explorer_10',
    title: 'Game Explorer',
    description: 'Add 10 games to your library',
    icon: GameController,
    color: '#00D2FF',
    unlocked: false,
    category: 'gaming',
    requirement: { type: 'game_count', target: 10 },
  },
  {
    id: 'game_collector_50',
    title: 'Game Collector',
    description: 'Add 50 games to your library',
    icon: GameController,
    color: '#00D2FF',
    unlocked: false,
    category: 'gaming',
    requirement: { type: 'game_count', target: 50 },
  },
  {
    id: 'game_enthusiast_100',
    title: 'Game Enthusiast',
    description: 'Add 100 games to your library',
    icon: Trophy,
    color: '#00D2FF',
    unlocked: false,
    category: 'gaming',
    requirement: { type: 'game_count', target: 100 },
  },

  // Streak Achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: '3 day activity streak',
    icon: Fire,
    color: '#F43F5E',
    unlocked: false,
    category: 'dedication',
    requirement: { type: 'streak_count', target: 3 },
  },
  {
    id: 'streak_7',
    title: 'Streak Master',
    description: '7 day activity streak',
    icon: Fire,
    color: '#F43F5E',
    unlocked: false,
    category: 'dedication',
    requirement: { type: 'streak_count', target: 7 },
  },
  {
    id: 'streak_30',
    title: 'Dedication Champion',
    description: '30 day activity streak',
    icon: Crown,
    color: '#F43F5E',
    unlocked: false,
    category: 'dedication',
    requirement: { type: 'streak_count', target: 30 },
  },

  // Rating Achievements
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Give 10 games a 5-star rating',
    icon: Heart,
    color: '#8B5CF6',
    unlocked: false,
    category: 'reviews',
    requirement: { type: 'rating_count', target: 10 },
  },
];

// Storage keys
const STORAGE_KEYS = {
  ACHIEVEMENTS: '@achievements',
  USER_STATS: '@user_stats',
  LAST_ACTIVITY_DATE: '@last_activity_date',
};

// User stats for tracking progress
export interface UserStats {
  reviewCount: number;
  listCount: number;
  gameCount: number;
  currentStreak: number;
  longestStreak: number;
  fiveStarCount: number;
  lastActivityDate: string;
  genreCounts: { [genre: string]: number }; // Track genre frequencies
}

class AchievementService {
  // Initialize achievements from storage or use defaults
  async getAchievements(): Promise<Achievement[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (stored) {
        return JSON.parse(stored);
      }
      // First time - save default achievements
      await this.saveAchievements(ACHIEVEMENT_DEFINITIONS);
      return ACHIEVEMENT_DEFINITIONS;
    } catch (error) {
      console.error('Error loading achievements:', error);
      return ACHIEVEMENT_DEFINITIONS;
    }
  }

  // Save achievements to storage
  private async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  // Get user stats
  async getUserStats(): Promise<UserStats> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (stored) {
        return JSON.parse(stored);
      }
      const defaultStats: UserStats = {
        reviewCount: 0,
        listCount: 0,
        gameCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        fiveStarCount: 0,
        lastActivityDate: '',
        genreCounts: {},
      };
      await this.saveUserStats(defaultStats);
      return defaultStats;
    } catch (error) {
      console.error('Error loading user stats:', error);
      return {
        reviewCount: 0,
        listCount: 0,
        gameCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        fiveStarCount: 0,
        lastActivityDate: '',
        genreCounts: {},
      };
    }
  }

  // Save user stats
  private async saveUserStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_STATS,
        JSON.stringify(stats)
      );
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  // Update activity streak
  private async updateStreak(stats: UserStats): Promise<UserStats> {
    const today = new Date().toDateString();
    const lastActivity = stats.lastActivityDate;

    if (!lastActivity) {
      // First activity
      stats.currentStreak = 1;
      stats.longestStreak = 1;
    } else {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day - no change to streak
        return stats;
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        // Streak broken - reset to 1
        stats.currentStreak = 1;
      }
    }

    stats.lastActivityDate = today;
    return stats;
  }

  // Check and unlock achievements based on current stats
  private async checkAchievements(
    stats: UserStats
  ): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    let newlyUnlocked: Achievement[] = [];

    achievements.forEach((achievement) => {
      if (!achievement.unlocked) {
        let shouldUnlock = false;

        switch (achievement.requirement.type) {
          case 'review_count':
            shouldUnlock = stats.reviewCount >= achievement.requirement.target;
            break;
          case 'list_count':
            shouldUnlock = stats.listCount >= achievement.requirement.target;
            break;
          case 'game_count':
            shouldUnlock = stats.gameCount >= achievement.requirement.target;
            break;
          case 'streak_count':
            shouldUnlock = stats.currentStreak >= achievement.requirement.target;
            break;
          case 'rating_count':
            shouldUnlock = stats.fiveStarCount >= achievement.requirement.target;
            break;
        }

        if (shouldUnlock) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(achievement);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      await this.saveAchievements(achievements);
    }

    return newlyUnlocked;
  }

  // Track when user writes a review
  async trackReview(rating: number, genres?: string[]): Promise<Achievement[]> {
    const stats = await this.getUserStats();
    stats.reviewCount += 1;
    
    if (rating === 5) {
      stats.fiveStarCount += 1;
    }
    
    // Track genres if provided
    if (genres && genres.length > 0) {
      if (!stats.genreCounts) {
        stats.genreCounts = {};
      }
      genres.forEach((genre) => {
        stats.genreCounts[genre] = (stats.genreCounts[genre] || 0) + 1;
      });
    }

    await this.updateStreak(stats);
    await this.saveUserStats(stats);

    return await this.checkAchievements(stats);
  }

  // Track when user creates a list
  async trackListCreated(): Promise<Achievement[]> {
    const stats = await this.getUserStats();
    stats.listCount += 1;

    await this.updateStreak(stats);
    await this.saveUserStats(stats);

    return await this.checkAchievements(stats);
  }

  // Track when user deletes a list
  async trackListDeleted(): Promise<void> {
    const stats = await this.getUserStats();
    if (stats.listCount > 0) {
      stats.listCount -= 1;
      await this.saveUserStats(stats);
    }
  }

  // Track when user adds a game to library
  async trackGameAdded(genres?: string[]): Promise<Achievement[]> {
    const stats = await this.getUserStats();
    stats.gameCount += 1;
    
    // Track genres if provided
    if (genres && genres.length > 0) {
      if (!stats.genreCounts) {
        stats.genreCounts = {};
      }
      genres.forEach((genre) => {
        stats.genreCounts[genre] = (stats.genreCounts[genre] || 0) + 1;
      });
    }

    await this.updateStreak(stats);
    await this.saveUserStats(stats);

    return await this.checkAchievements(stats);
  }

  // Track when user removes a game from library
  async trackGameRemoved(genres?: string[]): Promise<void> {
    const stats = await this.getUserStats();
    if (stats.gameCount > 0) {
      stats.gameCount -= 1;
    }
    
    // Decrement genre counts if provided
    if (genres && genres.length > 0 && stats.genreCounts) {
      genres.forEach((genre) => {
        if (stats.genreCounts[genre] && stats.genreCounts[genre] > 0) {
          stats.genreCounts[genre] -= 1;
          // Remove genre if count reaches 0
          if (stats.genreCounts[genre] === 0) {
            delete stats.genreCounts[genre];
          }
        }
      });
    }
    
    await this.saveUserStats(stats);
  }

  // Track when user deletes a review
  async trackReviewDeleted(rating: number, genres?: string[]): Promise<void> {
    const stats = await this.getUserStats();
    if (stats.reviewCount > 0) {
      stats.reviewCount -= 1;
    }
    if (rating === 5 && stats.fiveStarCount > 0) {
      stats.fiveStarCount -= 1;
    }
    
    // Decrement genre counts if provided
    if (genres && genres.length > 0 && stats.genreCounts) {
      genres.forEach((genre) => {
        if (stats.genreCounts[genre] && stats.genreCounts[genre] > 0) {
          stats.genreCounts[genre] -= 1;
          // Remove genre if count reaches 0
          if (stats.genreCounts[genre] === 0) {
            delete stats.genreCounts[genre];
          }
        }
      });
    }
    
    await this.saveUserStats(stats);
  }

  // Get recently unlocked achievements (last 3)
  async getRecentAchievements(): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const unlocked = achievements
      .filter((a) => a.unlocked && a.unlockedAt)
      .sort((a, b) => {
        const dateA = new Date(a.unlockedAt!).getTime();
        const dateB = new Date(b.unlockedAt!).getTime();
        return dateB - dateA; // Most recent first
      });

    return unlocked.slice(0, 3);
  }

  // Get top favorite genres (sorted by count)
  async getFavoriteGenres(limit: number = 3): Promise<string[]> {
    const stats = await this.getUserStats();
    if (!stats.genreCounts || Object.keys(stats.genreCounts).length === 0) {
      return [];
    }
    
    // Sort genres by count (descending) and return top N
    return Object.entries(stats.genreCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([genre]) => genre);
  }

  // Get total unlocked achievements count
  async getUnlockedCount(): Promise<number> {
    const achievements = await this.getAchievements();
    return achievements.filter((a) => a.unlocked).length;
  }

  // Reset all achievements (for testing/debugging)
  async resetAchievements(): Promise<void> {
    await this.saveAchievements(ACHIEVEMENT_DEFINITIONS);
    const defaultStats: UserStats = {
      reviewCount: 0,
      listCount: 0,
      gameCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      fiveStarCount: 0,
      lastActivityDate: '',
      genreCounts: {},
    };
    await this.saveUserStats(defaultStats);
  }
}

export const achievementService = new AchievementService();
