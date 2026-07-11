import { apiRequest } from '@/lib/api';

// Review shape returned by the backend. `$id` is the Postgres review UUID.
export interface Review {
  $id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  gameId: string;
  gameName: string;
  gameCover?: string;
  status?: string;
  rating: number;
  reviewText: string;
  playTime?: string;
  difficulty?: string;
  platform?: string;
  tags?: string;
  isPublic: boolean;
  date: string;
  verified: boolean;
  helpful?: number;
  helpfulByMe?: boolean;
}

export interface PublicUser {
  id: string;
  username: string;
  avatarUrl: string;
  createdAt?: string;
  private?: boolean;
}

export class ReviewService {
  // Create a new review
  static async createReview(reviewData: Omit<Review, '$id'>): Promise<Review> {
    try {
      const res = await apiRequest<{ review: Review }>('/api/reviews', {
        method: 'POST',
        auth: true,
        body: {
          username: reviewData.username,
          userAvatar: reviewData.userAvatar || '',
          gameId: reviewData.gameId,
          gameName: reviewData.gameName,
          gameCover: reviewData.gameCover || '',
          status: reviewData.status || 'completed',
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
          playTime: reviewData.playTime || '',
          difficulty: reviewData.difficulty || '',
          platform: reviewData.platform || '',
          tags: Array.isArray(reviewData.tags) ? reviewData.tags.join(',') : (reviewData.tags || ''),
          isPublic: reviewData.isPublic,
          date: reviewData.date,
          verified: reviewData.verified,
        },
      });
      return res.review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review');
    }
  }

  // Get all public reviews for a specific game (community reviews)
  static async getGameReviews(gameId: string, sort: 'date' | 'rating' | 'helpful' = 'date'): Promise<Review[]> {
    try {
      const res = await apiRequest<{ reviews: Review[] }>(
        `/api/reviews?gameId=${encodeURIComponent(gameId)}&isPublic=true&sort=${sort}`,
        { auth: true } // optional auth so helpfulByMe is populated when signed in
      );
      return res.reviews;
    } catch (error) {
      console.error('Error fetching game reviews:', error);
      throw new Error('Failed to fetch game reviews');
    }
  }

  // Toggle a "helpful" vote on a review; returns the new count + my state.
  static async voteHelpful(reviewId: string): Promise<{ helpful: number; helpfulByMe: boolean }> {
    return apiRequest<{ helpful: number; helpfulByMe: boolean }>(
      `/api/reviews/${encodeURIComponent(reviewId)}/helpful`,
      { method: 'POST', auth: true }
    );
  }

  // Public profile basics for a reviewer.
  static async getPublicUser(userId: string): Promise<PublicUser | null> {
    try {
      const res = await apiRequest<{ user: PublicUser }>(`/api/users/${encodeURIComponent(userId)}`);
      return res.user;
    } catch (error) {
      console.error('Error fetching public user:', error);
      return null;
    }
  }

  // A user's PUBLIC reviews (for their public profile).
  static async getUserPublicReviews(userId: string): Promise<Review[]> {
    try {
      const res = await apiRequest<{ reviews: Review[] }>(
        `/api/reviews?userId=${encodeURIComponent(userId)}&isPublic=true&sort=date`,
        { auth: true } // so viewing your OWN profile isn't blocked by the privacy filter
      );
      return res.reviews;
    } catch (error) {
      console.error('Error fetching user public reviews:', error);
      return [];
    }
  }

  // Get all reviews by a specific user
  static async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const res = await apiRequest<{ reviews: Review[] }>(
        `/api/reviews?userId=${encodeURIComponent(userId)}`,
        { auth: true } // send token so the server recognizes these as MY reviews (privacy filter)
      );
      return res.reviews;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch user reviews');
    }
  }

  // Get a specific review by ID
  static async getReviewById(reviewId: string): Promise<Review | null> {
    try {
      const res = await apiRequest<{ review: Review }>(
        `/api/reviews/${encodeURIComponent(reviewId)}`
      );
      return res.review;
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      return null;
    }
  }

  // Update a review
  static async updateReview(reviewId: string, updateData: Partial<Review>): Promise<Review> {
    try {
      const res = await apiRequest<{ review: Review }>(
        `/api/reviews/${encodeURIComponent(reviewId)}`,
        { method: 'PATCH', auth: true, body: updateData }
      );
      return res.review;
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review');
    }
  }

  // Delete a review
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      await apiRequest(`/api/reviews/${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
        auth: true,
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review');
    }
  }

  // Get all public reviews (for trending/community)
  static async getAllPublicReviews(limit: number = 20): Promise<Review[]> {
    try {
      const res = await apiRequest<{ reviews: Review[] }>(
        `/api/reviews?isPublic=true&limit=${limit}`
      );
      return res.reviews;
    } catch (error) {
      console.error('Error fetching all public reviews:', error);
      throw new Error('Failed to fetch public reviews');
    }
  }

  // Check if user has reviewed a specific game
  static async hasUserReviewedGame(userId: string, gameId: string): Promise<boolean> {
    try {
      const res = await apiRequest<{ reviews: Review[] }>(
        `/api/reviews?userId=${encodeURIComponent(userId)}&gameId=${encodeURIComponent(gameId)}`
      );
      return res.reviews.length > 0;
    } catch (error) {
      console.error('Error checking if user reviewed game:', error);
      return false;
    }
  }

  // Get user's review for a specific game
  static async getUserReviewForGame(userId: string, gameId: string): Promise<Review | null> {
    try {
      const res = await apiRequest<{ reviews: Review[] }>(
        `/api/reviews?userId=${encodeURIComponent(userId)}&gameId=${encodeURIComponent(gameId)}`
      );
      return res.reviews.length > 0 ? res.reviews[0] : null;
    } catch (error) {
      console.error('Error fetching user review for game:', error);
      return null;
    }
  }

  // Test function to check if the backend is reachable
  static async testConnection(): Promise<boolean> {
    try {
      await apiRequest('/api/reviews?limit=1');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default ReviewService;
