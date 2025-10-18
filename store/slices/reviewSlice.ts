import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReviewGameRef {
  id: number;
  name: string;
  coverUrl?: string;
  firstReleaseYear?: number;
}

export interface ReviewItem {
  id: string;
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
}

interface ReviewState {
  reviews: ReviewItem[];
}

const initialState: ReviewState = {
  reviews: [],
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
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
  },
});

export const { upsertReview, deleteReviewByGameId } = reviewSlice.actions;
export default reviewSlice.reducer;

