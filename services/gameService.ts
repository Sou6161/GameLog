import { apiRequest } from '@/lib/api';

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

// Normalize a raw IGDB game (as returned by the backend) into our Game shape.
function normalize(raw: any): Game {
  return {
    id: String(raw.id),
    igdbId: raw.id,
    title: raw.name,
    coverUrl: raw.cover?.url,
    releaseDate: raw.first_release_date
      ? new Date(raw.first_release_date * 1000).toISOString()
      : undefined,
    rating: raw.rating,
    platforms: (raw.platforms || []).map((p: any) => p.name),
    genres: (raw.genres || []).map((g: any) => g.name),
    summary: raw.summary,
  };
}

class GameService {
  // Search games via the backend IGDB proxy.
  async searchGames(query: string): Promise<Game[]> {
    try {
      const data = await apiRequest<any[]>('/api/games/search', {
        method: 'POST',
        body: { query, limit: 10 },
      });
      return data.map(normalize);
    } catch (error) {
      console.error('Error searching games:', error);
      return [];
    }
  }

  // Get game details via the backend IGDB proxy.
  async getGameDetails(igdbId: number): Promise<Game | null> {
    try {
      const raw = await apiRequest<any>(`/api/games/${igdbId}`);
      return normalize(raw);
    } catch (error) {
      console.error('Error fetching game details:', error);
      return null;
    }
  }

  // Get trending games via the backend IGDB proxy.
  async getTrendingGames(): Promise<Game[]> {
    try {
      const data = await apiRequest<any[]>('/api/games/trending?limit=10');
      return data.map(normalize);
    } catch (error) {
      console.error('Error fetching trending games:', error);
      return [];
    }
  }

  // Game statuses (library) are stored locally in Redux for now, so there is no
  // server-side source. Returns an empty list; kept for API compatibility.
  async getUserGameStatuses(_userId: string): Promise<GameStatus[]> {
    return [];
  }
}

export const gameService = new GameService();
