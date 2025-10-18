import { useState, useEffect } from 'react';
import { CommunityService, CommunityReview, CommunityUser } from '@/services/communityService';

export interface UseCommunityReviewsReturn {
  reviews: CommunityReview[];
  loading: boolean;
  error: string | null;
  refreshReviews: () => Promise<void>;
}

export function useCommunityReviews(gameId?: string): UseCommunityReviewsReturn {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const gameReviews = await CommunityService.getGameReviews(gameId, 20);
      setReviews(gameReviews);
    } catch (err) {
      setError('Failed to load community reviews');
      console.error('Error fetching community reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshReviews = async () => {
    await fetchReviews();
  };

  useEffect(() => {
    fetchReviews();
  }, [gameId]);

  return {
    reviews,
    loading,
    error,
    refreshReviews,
  };
}

export function useAllCommunityReviews() {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allReviews = await CommunityService.getAllReviews(50);
      setReviews(allReviews);
    } catch (err) {
      setError('Failed to load community reviews');
      console.error('Error fetching all community reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshReviews = async () => {
    await fetchAllReviews();
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  return {
    reviews,
    loading,
    error,
    refreshReviews,
  };
}

export function useTrendingReviews() {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const trendingReviews = await CommunityService.getTrendingReviews(15);
      setReviews(trendingReviews);
    } catch (err) {
      setError('Failed to load trending reviews');
      console.error('Error fetching trending reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingReviews();
  }, []);

  return {
    reviews,
    loading,
    error,
    refreshReviews: fetchTrendingReviews,
  };
}

export function useUserProfile(userId: string) {
  const [user, setUser] = useState<CommunityUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userProfile = await CommunityService.getUserProfile(userId);
      setUser(userProfile);
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  return {
    user,
    loading,
    error,
    refreshProfile: fetchUserProfile,
  };
}
