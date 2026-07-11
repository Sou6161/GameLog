import { apiRequest } from '@/lib/api';

export interface LibraryGame {
  id: string; // IGDB game id
  title: string;
  coverUrl?: string;
  genre?: string;
  status: string; // backlog | playing | completed | dropped
  source: 'manual' | 'steam';
  platform?: string;
  steamAppId?: string;
  steamPlaytimeMinutes?: number;
  addedDate?: string;
}

export class LibraryService {
  static async getLibrary(): Promise<LibraryGame[]> {
    const res = await apiRequest<{ games: LibraryGame[] }>('/api/library', { auth: true });
    return res.games;
  }

  static async addGame(game: {
    gameId: string;
    title: string;
    coverUrl?: string;
    genre?: string;
    status?: string;
    platform?: string;
  }): Promise<LibraryGame> {
    const res = await apiRequest<{ game: LibraryGame }>('/api/library', {
      method: 'POST',
      auth: true,
      body: game,
    });
    return res.game;
  }

  static async updateGame(
    gameId: string,
    patch: { status?: string; platform?: string; genre?: string }
  ): Promise<LibraryGame> {
    const res = await apiRequest<{ game: LibraryGame }>(
      `/api/library/${encodeURIComponent(gameId)}`,
      { method: 'PATCH', auth: true, body: patch }
    );
    return res.game;
  }

  static async removeGame(gameId: string): Promise<void> {
    await apiRequest(`/api/library/${encodeURIComponent(gameId)}`, {
      method: 'DELETE',
      auth: true,
    });
  }
}

export default LibraryService;
