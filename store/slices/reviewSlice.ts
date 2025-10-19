import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReviewService, AppwriteReview } from '@/services/reviewService';

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

interface ReviewState {
  reviews: ReviewItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setReviews: (state, action: PayloadAction<ReviewItem[]>) => {
      state.reviews = action.payload;
    },
    upsertReview: (state, action: PayloadAction<ReviewItem>) => {
      const idx = state.reviews.findIndex(r => r.game.id === action.payload.game.id);
      if (idx >= 0) {
        state.reviews[idx] = { ...action.payload, id: state.reviews[idx].id };
      } else {
        state.reviews.unshift(action.payload);
      }
    },
    deleteReviewByGameId: (state, action: PayloadAction<number>) => {
      state.reviews = state.reviews.filter(r => r.game.id !== action.payload);
    },
    deleteReviewById: (state, action: PayloadAction<string>) => {
      state.reviews = state.reviews.filter(r => r.id !== action.payload);
    },
  },
});

// Convert AppwriteReview to ReviewItem
export const convertAppwriteReviewToReviewItem = (appwriteReview: AppwriteReview): ReviewItem => ({
  id: appwriteReview.$id,
  userId: appwriteReview.userId,
  username: appwriteReview.username,
  userAvatar: appwriteReview.userAvatar,
  game: {
    id: parseInt(appwriteReview.gameId),
    name: appwriteReview.gameName,
  },
  status: 'completed', // Default status
  rating: appwriteReview.rating,
  reviewText: appwriteReview.reviewText,
  playTime: appwriteReview.playTime || '',
  difficulty: appwriteReview.difficulty || '',
  platform: appwriteReview.platform || '',
  tags: typeof appwriteReview.tags === 'string' ? appwriteReview.tags.split(',').filter(tag => tag.trim()) : (appwriteReview.tags || []),
  isPublic: appwriteReview.isPublic,
  date: appwriteReview.date,
  verified: appwriteReview.verified,
});

// Convert ReviewItem to AppwriteReview format
export const convertReviewItemToAppwrite = (reviewItem: ReviewItem): Omit<AppwriteReview, '$id'> => ({
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

// Async thunks for Appwrite operations
export const fetchUserReviews = (userId: string) => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    const appwriteReviews = await ReviewService.getUserReviews(userId);
    const reviews = appwriteReviews.map(convertAppwriteReviewToReviewItem);
    dispatch(setReviews(reviews));
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    // Don't set error state, just log it and continue with empty reviews
    dispatch(setReviews([]));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchGameReviews = (gameId: string) => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    const appwriteReviews = await ReviewService.getGameReviews(gameId);
    const reviews = appwriteReviews.map(convertAppwriteReviewToReviewItem);
    dispatch(setReviews(reviews));
  } catch (error) {
    console.error('Error fetching game reviews:', error);
    // Don't set error state, just log it and continue with empty reviews
    dispatch(setReviews([]));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createReview = (reviewData: Omit<ReviewItem, 'id'>) => async (dispatch: any) => {
  try {
    const appwriteData = convertReviewItemToAppwrite(reviewData as ReviewItem);
    const appwriteReview = await ReviewService.createReview(appwriteData);
    const review = convertAppwriteReviewToReviewItem(appwriteReview);
    dispatch(upsertReview(review));
    return review;
  } catch (error) {
    dispatch(setError('Failed to create review'));
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = (reviewId: string, updateData: Partial<ReviewItem>) => async (dispatch: any) => {
  try {
    const appwriteReview = await ReviewService.updateReview(reviewId, updateData);
    const review = convertAppwriteReviewToReviewItem(appwriteReview);
    dispatch(upsertReview(review));
    return review;
  } catch (error) {
    dispatch(setError('Failed to update review'));
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = (reviewId: string) => async (dispatch: any) => {
  try {
    await ReviewService.deleteReview(reviewId);
    dispatch(deleteReviewById(reviewId));
  } catch (error) {
    dispatch(setError('Failed to delete review'));
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const hasUserReviewedGame = (userId: string, gameId: string) => async (dispatch: any) => {
  try {
    const hasReviewed = await ReviewService.hasUserReviewedGame(userId, gameId);
    return hasReviewed;
  } catch (error) {
    console.error('Error checking if user reviewed game:', error);
    return false;
  }
};

export const getUserReviewForGame = (userId: string, gameId: string) => async (dispatch: any) => {
  try {
    const appwriteReview = await ReviewService.getUserReviewForGame(userId, gameId);
    if (appwriteReview) {
      const review = convertAppwriteReviewToReviewItem(appwriteReview);
      return review;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user review for game:', error);
    return null;
  }
};

export const { 
  setLoading, 
  setError, 
  setReviews, 
  upsertReview, 
  deleteReviewByGameId, 
  deleteReviewById 
} = reviewSlice.actions;

export default reviewSlice.reducer;

