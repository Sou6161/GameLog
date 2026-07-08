import { create } from 'zustand';
import { ReviewService, Review } from '@/services/reviewService';

export interface ReviewGameRef {
  id: number;
  name: string;
  coverUrl?: string;
  firstReleaseYear?: number;
}

export interface ReviewItem {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  game: ReviewGameRef;
  status: string;
  rating: number;
  reviewText: string;
  playTime: string;
  difficulty: string;
  platform: string;
  tags: string[];
  isPublic: boolean;
  date: string;
  verified: boolean;
}

// Convert backend Review to ReviewItem
export const convertReviewToItem = (backendReview: Review): ReviewItem => ({
  id: backendReview.$id,
  userId: backendReview.userId,
  username: backendReview.username,
  userAvatar: backendReview.userAvatar,
  game: {
    id: parseInt(backendReview.gameId),
    name: backendReview.gameName,
  },
  status: 'completed', // Default status
  rating: backendReview.rating,
  reviewText: backendReview.reviewText,
  playTime: backendReview.playTime || '',
  difficulty: backendReview.difficulty || '',
  platform: backendReview.platform || '',
  tags: typeof backendReview.tags === 'string' ? backendReview.tags.split(',').filter(tag => tag.trim()) : (backendReview.tags || []),
  isPublic: backendReview.isPublic,
  date: backendReview.date,
  verified: backendReview.verified,
});

// Convert ReviewItem to backend Review format
export const convertItemToReview = (reviewItem: ReviewItem): Omit<Review, '$id'> => ({
  userId: reviewItem.userId,
  username: reviewItem.username,
  userAvatar: reviewItem.userAvatar || '',
  gameId: reviewItem.game.id.toString(),
  gameName: reviewItem.game.name,
  rating: reviewItem.rating,
  reviewText: reviewItem.reviewText,
  playTime: reviewItem.playTime,
  difficulty: reviewItem.difficulty,
  platform: reviewItem.platform,
  tags: Array.isArray(reviewItem.tags) ? reviewItem.tags.join(',') : (reviewItem.tags || ''),
  isPublic: reviewItem.isPublic,
  date: reviewItem.date,
  verified: reviewItem.verified,
});

interface ReviewState {
  reviews: ReviewItem[];
  loading: boolean;
  error: string | null;

  // Sync setters
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setReviews: (reviews: ReviewItem[]) => void;
  upsertReview: (review: ReviewItem) => void;
  deleteReviewByGameId: (gameId: number) => void;
  deleteReviewById: (id: string) => void;

  // Async operations (backed by ReviewService)
  fetchUserReviews: (userId: string) => Promise<void>;
  fetchGameReviews: (gameId: string) => Promise<void>;
  createReview: (reviewData: Omit<ReviewItem, 'id'>) => Promise<ReviewItem>;
  updateReview: (reviewId: string, updateData: Partial<ReviewItem>) => Promise<ReviewItem>;
  deleteReview: (reviewId: string) => Promise<void>;
  hasUserReviewedGame: (userId: string, gameId: string) => Promise<boolean>;
  getUserReviewForGame: (userId: string, gameId: string) => Promise<ReviewItem | null>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setReviews: (reviews) => set({ reviews }),

  upsertReview: (review) =>
    set((state) => {
      const idx = state.reviews.findIndex((r) => r.game.id === review.game.id);
      if (idx >= 0) {
        const next = [...state.reviews];
        next[idx] = { ...review, id: state.reviews[idx].id };
        return { reviews: next };
      }
      return { reviews: [review, ...state.reviews] };
    }),

  deleteReviewByGameId: (gameId) =>
    set((state) => ({ reviews: state.reviews.filter((r) => r.game.id !== gameId) })),

  deleteReviewById: (id) =>
    set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) })),

  fetchUserReviews: async (userId) => {
    set({ loading: true });
    try {
      const backendReviews = await ReviewService.getUserReviews(userId);
      set({ reviews: backendReviews.map(convertReviewToItem) });
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      // Don't set error state, just log it and continue with empty reviews
      set({ reviews: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchGameReviews: async (gameId) => {
    set({ loading: true });
    try {
      const backendReviews = await ReviewService.getGameReviews(gameId);
      set({ reviews: backendReviews.map(convertReviewToItem) });
    } catch (error) {
      console.error('Error fetching game reviews:', error);
      set({ reviews: [] });
    } finally {
      set({ loading: false });
    }
  },

  createReview: async (reviewData) => {
    try {
      const payload = convertItemToReview(reviewData as ReviewItem);
      const backendReview = await ReviewService.createReview(payload);
      const review = convertReviewToItem(backendReview);
      get().upsertReview(review);
      return review;
    } catch (error) {
      set({ error: 'Failed to create review' });
      console.error('Error creating review:', error);
      throw error;
    }
  },

  updateReview: async (reviewId, updateData) => {
    try {
      const backendReview = await ReviewService.updateReview(reviewId, updateData as Partial<Review>);
      const review = convertReviewToItem(backendReview);
      get().upsertReview(review);
      return review;
    } catch (error) {
      set({ error: 'Failed to update review' });
      console.error('Error updating review:', error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      await ReviewService.deleteReview(reviewId);
      get().deleteReviewById(reviewId);
    } catch (error) {
      set({ error: 'Failed to delete review' });
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  hasUserReviewedGame: async (userId, gameId) => {
    try {
      return await ReviewService.hasUserReviewedGame(userId, gameId);
    } catch (error) {
      console.error('Error checking if user reviewed game:', error);
      return false;
    }
  },

  getUserReviewForGame: async (userId, gameId) => {
    try {
      const backendReview = await ReviewService.getUserReviewForGame(userId, gameId);
      return backendReview ? convertReviewToItem(backendReview) : null;
    } catch (error) {
      console.error('Error fetching user review for game:', error);
      return null;
    }
  },
}));
