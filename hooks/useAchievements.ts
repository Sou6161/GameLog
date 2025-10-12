import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  achievementService,
  Achievement,
  UserStats,
} from '@/services/achievementService';

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load achievements and stats on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [achievementsData, statsData] = await Promise.all([
        achievementService.getAchievements(),
        achievementService.getUserStats(),
      ]);
      setAchievements(achievementsData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show achievement unlock notification
  const showAchievementNotification = (achievement: Achievement) => {
    Alert.alert(
      '🏆 Achievement Unlocked!',
      `${achievement.title}\n${achievement.description}`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  // Track review and check for unlocked achievements
  const trackReview = async (rating: number, genres?: string[]) => {
    try {
      const newlyUnlocked = await achievementService.trackReview(rating, genres);
      
      // Reload data
      await loadData();

      // Show notifications for newly unlocked achievements
      newlyUnlocked.forEach((achievement) => {
        showAchievementNotification(achievement);
      });

      return newlyUnlocked;
    } catch (error) {
      console.error('Error tracking review:', error);
      return [];
    }
  };

  // Track list creation
  const trackListCreated = async () => {
    try {
      const newlyUnlocked = await achievementService.trackListCreated();
      
      await loadData();

      newlyUnlocked.forEach((achievement) => {
        showAchievementNotification(achievement);
      });

      return newlyUnlocked;
    } catch (error) {
      console.error('Error tracking list creation:', error);
      return [];
    }
  };

  // Track list deletion
  const trackListDeleted = async () => {
    try {
      await achievementService.trackListDeleted();
      await loadData();
    } catch (error) {
      console.error('Error tracking list deletion:', error);
    }
  };

  // Track game addition
  const trackGameAdded = async (genres?: string[]) => {
    try {
      const newlyUnlocked = await achievementService.trackGameAdded(genres);
      
      await loadData();

      newlyUnlocked.forEach((achievement) => {
        showAchievementNotification(achievement);
      });

      return newlyUnlocked;
    } catch (error) {
      console.error('Error tracking game addition:', error);
      return [];
    }
  };

  // Track game removal
  const trackGameRemoved = async (genres?: string[]) => {
    try {
      await achievementService.trackGameRemoved(genres);
      await loadData();
    } catch (error) {
      console.error('Error tracking game removal:', error);
    }
  };

  // Track review deletion
  const trackReviewDeleted = async (rating: number, genres?: string[]) => {
    try {
      await achievementService.trackReviewDeleted(rating, genres);
      await loadData();
    } catch (error) {
      console.error('Error tracking review deletion:', error);
    }
  };

  // Get recent achievements
  const getRecentAchievements = async (): Promise<Achievement[]> => {
    try {
      return await achievementService.getRecentAchievements();
    } catch (error) {
      console.error('Error getting recent achievements:', error);
      return [];
    }
  };

  // Get unlocked count
  const getUnlockedCount = async (): Promise<number> => {
    try {
      return await achievementService.getUnlockedCount();
    } catch (error) {
      console.error('Error getting unlocked count:', error);
      return 0;
    }
  };
  
  // Get favorite genres
  const getFavoriteGenres = async (limit: number = 3): Promise<string[]> => {
    try {
      return await achievementService.getFavoriteGenres(limit);
    } catch (error) {
      console.error('Error getting favorite genres:', error);
      return [];
    }
  };

  // Reset achievements (for testing)
  const resetAchievements = async () => {
    try {
      await achievementService.resetAchievements();
      await loadData();
    } catch (error) {
      console.error('Error resetting achievements:', error);
    }
  };

  return {
    achievements,
    userStats,
    loading,
    trackReview,
    trackListCreated,
    trackListDeleted,
    trackGameAdded,
    trackGameRemoved,
    trackReviewDeleted,
    getRecentAchievements,
    getUnlockedCount,
    getFavoriteGenres,
    resetAchievements,
    refresh: loadData,
  };
}
