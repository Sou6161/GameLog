import { appwrite, ID, Query } from '@/lib/appwrite';

const DATABASE_ID = '68f4a3b40026f763fcdc';
const REVIEWS_COLLECTION_ID = 'reviews';

export interface AppwriteReview {
  $id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  gameId: string;
  gameName: string;
  rating: number;
  reviewText: string;
  playTime?: string;
  difficulty?: string;
  platform?: string;
  tags?: string;
  isPublic: boolean;
  date: string;
  verified: boolean;
}

export class ReviewService {
  // Create a new review
  static async createReview(reviewData: Omit<AppwriteReview, '$id'>): Promise<AppwriteReview> {
    try {
      console.log('Creating review with data:', reviewData);
      console.log('ID.unique():', ID.unique());
      console.log('appwrite.databases:', appwrite.databases);
      
      const review = await appwrite.databases.createDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        ID.unique(),
        {
          userId: reviewData.userId,
          username: reviewData.username,
          userAvatar: reviewData.userAvatar || '',
          gameId: reviewData.gameId,
          gameName: reviewData.gameName,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
          playTime: reviewData.playTime || '',
          difficulty: reviewData.difficulty || '',
          platform: reviewData.platform || '',
          tags: Array.isArray(reviewData.tags) ? reviewData.tags.join(',') : (reviewData.tags || ''),
          isPublic: reviewData.isPublic,
          date: reviewData.date,
          verified: reviewData.verified,
        }
      );

      return review as AppwriteReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review');
    }
  }

  // Get all reviews for a specific game (community reviews)
  static async getGameReviews(gameId: string): Promise<AppwriteReview[]> {
    try {
      console.log('Fetching reviews for gameId:', gameId);
      console.log('Database ID:', DATABASE_ID);
      console.log('Collection ID:', REVIEWS_COLLECTION_ID);
      
      const reviews = await appwrite.databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal('gameId', gameId),
          Query.equal('isPublic', true),
          Query.orderDesc('date')
        ]
      );

      console.log('Fetched reviews:', reviews.documents);
      return reviews.documents as AppwriteReview[];
    } catch (error) {
      console.error('Error fetching game reviews:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to fetch game reviews');
    }
  }

  // Get all reviews by a specific user
  static async getUserReviews(userId: string): Promise<AppwriteReview[]> {
    try {
      const reviews = await appwrite.databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('date')
        ]
      );

      return reviews.documents as AppwriteReview[];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch user reviews');
    }
  }

  // Get a specific review by ID
  static async getReviewById(reviewId: string): Promise<AppwriteReview | null> {
    try {
      const review = await appwrite.databases.getDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        reviewId
      );

      return review as AppwriteReview;
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      return null;
    }
  }

  // Update a review
  static async updateReview(reviewId: string, updateData: Partial<AppwriteReview>): Promise<AppwriteReview> {
    try {
      const review = await appwrite.databases.updateDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        reviewId,
        updateData
      );

      return review as AppwriteReview;
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review');
    }
  }

  // Delete a review
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      await appwrite.databases.deleteDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        reviewId
      );
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review');
    }
  }

  // Get all public reviews (for trending/community)
  static async getAllPublicReviews(limit: number = 20): Promise<AppwriteReview[]> {
    try {
      const reviews = await appwrite.databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal('isPublic', true),
          Query.orderDesc('date'),
          Query.limit(limit)
        ]
      );

      return reviews.documents as AppwriteReview[];
    } catch (error) {
      console.error('Error fetching all public reviews:', error);
      throw new Error('Failed to fetch public reviews');
    }
  }

  // Check if user has reviewed a specific game
  static async hasUserReviewedGame(userId: string, gameId: string): Promise<boolean> {
    try {
      const reviews = await appwrite.databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('gameId', gameId)
        ]
      );

      return reviews.documents.length > 0;
    } catch (error) {
      console.error('Error checking if user reviewed game:', error);
      return false;
    }
  }

  // Get user's review for a specific game
  static async getUserReviewForGame(userId: string, gameId: string): Promise<AppwriteReview | null> {
    try {
      const reviews = await appwrite.databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('gameId', gameId)
        ]
      );

      return reviews.documents.length > 0 ? (reviews.documents[0] as AppwriteReview) : null;
    } catch (error) {
      console.error('Error fetching user review for game:', error);
      return null;
    }
  }

  // Test function to check if collection is accessible
  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Appwrite connection...');
      const result = await appwrite.databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [Query.limit(1)]
      );
      console.log('Connection test successful:', result);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default ReviewService;

