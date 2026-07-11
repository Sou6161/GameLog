import { apiRequest } from '@/lib/api';

export interface ListGame {
  id: string; // IGDB id
  title: string;
  coverUrl?: string;
  genre?: string;
}

export interface GameList {
  id: string;
  name: string;
  description: string;
  games: ListGame[];
  createdAt?: string;
}

export class ListService {
  static async getLists(): Promise<GameList[]> {
    const res = await apiRequest<{ lists: GameList[] }>('/api/lists', { auth: true });
    return res.lists;
  }

  static async createList(input: {
    name: string;
    description?: string;
    games?: ListGame[];
  }): Promise<GameList> {
    const res = await apiRequest<{ list: GameList }>('/api/lists', {
      method: 'POST',
      auth: true,
      body: input,
    });
    return res.list;
  }

  static async updateList(
    id: string,
    patch: { name?: string; description?: string; games?: ListGame[] }
  ): Promise<GameList> {
    const res = await apiRequest<{ list: GameList }>(`/api/lists/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      auth: true,
      body: patch,
    });
    return res.list;
  }

  static async deleteList(id: string): Promise<void> {
    await apiRequest(`/api/lists/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
  }
}

export default ListService;
