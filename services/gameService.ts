import { databases, functions, DATABASE_ID, COLLECTIONS } from './appwrite';

export interface Game {
  id: string;
  igdbId: number;
  steamAppId?: number;
  title: string;
  coverUrl?: string;
  releaseDate?: string;
  rating?: number;
  platforms: string[];
  genres: string[];
  summary?: string;
}

export interface GameStatus {
  id: string;
  userId: string;
  gameId: string;
  status: 'playing' | 'completed' | 'dropped' | 'backlog';
  rating?: number;
  startedAt?: string;
  finishedAt?: string;
  hours?: number;
}

class GameService {
  // Search games via IGDB API (through Appwrite Function)
  async searchGames(query: string): Promise<Game[]> {
    try {
      const response = await functions.createExecution(
        'igdb-search',
        JSON.stringify({ query })
      );
      
      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error searching games:', error);
      return [];
    }
  }

  // Get game details
  async getGameDetails(igdbId: number): Promise<Game | null> {
    try {
      const response = await functions.createExecution(
        'igdb-detail',
        JSON.stringify({ igdbId })
      );
      
      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error fetching game details:', error);
      return null;
    }
  }

  // Get trending games
  async getTrendingGames(): Promise<Game[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        [
          // Add queries for trending logic
        ]
      );
      
      return response.documents as Game[];
    } catch (error) {
      console.error('Error fetching trending games:', error);
      return [];
    }
  }

  // Log game session
  async logGameSession(data: Partial<GameStatus>): Promise<GameStatus | null> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.STATUSES,
        'unique()',
        {
          ...data,
          createdAt: new Date().toISOString(),
        }
      );
      
      return response as GameStatus;
    } catch (error) {
      console.error('Error logging game session:', error);
      return null;
    }
  }

  // Get user's game statuses
  async getUserGameStatuses(userId: string): Promise<GameStatus[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STATUSES,
        [
          // Add user filter query
        ]
      );
      
      return response.documents as GameStatus[];
    } catch (error) {
      console.error('Error fetching user game statuses:', error);
      return [];
    }
  }
}

export const gameService = new GameService();