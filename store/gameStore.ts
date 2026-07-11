import { create } from 'zustand';
import { LibraryService, LibraryGame } from '@/services/libraryService';

export interface Game {
  id: string;
  igdbId: number;
  title: string;
  coverUrl?: string;
  releaseDate?: string;
  rating?: number;
  platforms: string[];
  genres: string[];
}

export type { LibraryGame };

interface GameState {
  currentGame: Game | null;
  recentGames: Game[];
  trendingGames: Game[];
  libraryGames: LibraryGame[];
  libraryLoading: boolean;
  reviewedGameIds: string[];
  setCurrentGame: (game: Game) => void;
  setRecentGames: (games: Game[]) => void;
  setTrendingGames: (games: Game[]) => void;
  // Library is persisted on the backend (so Steam imports survive restarts).
  fetchLibrary: () => Promise<void>;
  addToLibrary: (game: Partial<LibraryGame> & { id: string; title: string }) => Promise<void>;
  removeFromLibrary: (id: string) => Promise<void>;
  setLibraryStatus: (id: string, status: string) => Promise<void>;
  markReviewed: (id: string) => void;
  unmarkReviewed: (id: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  recentGames: [],
  trendingGames: [],
  libraryGames: [],
  libraryLoading: false,
  reviewedGameIds: [],

  setCurrentGame: (game) => set({ currentGame: game }),
  setRecentGames: (games) => set({ recentGames: games }),
  setTrendingGames: (games) => set({ trendingGames: games }),

  fetchLibrary: async () => {
    set({ libraryLoading: true });
    try {
      const games = await LibraryService.getLibrary();
      set({ libraryGames: games });
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      set({ libraryLoading: false });
    }
  },

  // Optimistic add, reconciled with the server response.
  addToLibrary: async (game) => {
    const { libraryGames } = get();
    if (libraryGames.some((g) => g.id === game.id)) return;

    const optimistic: LibraryGame = {
      id: game.id,
      title: game.title,
      coverUrl: game.coverUrl,
      genre: game.genre,
      status: game.status || 'backlog',
      source: 'manual',
      addedDate: new Date().toISOString(),
    };
    set({ libraryGames: [optimistic, ...libraryGames] });

    try {
      const saved = await LibraryService.addGame({
        gameId: game.id,
        title: game.title,
        coverUrl: game.coverUrl,
        genre: game.genre,
        status: optimistic.status,
      });
      set((state) => ({
        libraryGames: state.libraryGames.map((g) => (g.id === saved.id ? saved : g)),
      }));
    } catch (error) {
      console.error('Error adding to library:', error);
      // Roll back so the UI doesn't claim something that wasn't saved.
      set((state) => ({ libraryGames: state.libraryGames.filter((g) => g.id !== game.id) }));
      throw error;
    }
  },

  removeFromLibrary: async (id) => {
    const previous = get().libraryGames;
    set({ libraryGames: previous.filter((g) => g.id !== id) });
    try {
      await LibraryService.removeGame(id);
    } catch (error) {
      console.error('Error removing from library:', error);
      set({ libraryGames: previous });
      throw error;
    }
  },

  setLibraryStatus: async (id, status) => {
    const previous = get().libraryGames;
    set({ libraryGames: previous.map((g) => (g.id === id ? { ...g, status } : g)) });
    try {
      await LibraryService.updateGame(id, { status });
    } catch (error) {
      console.error('Error updating library status:', error);
      set({ libraryGames: previous });
    }
  },

  markReviewed: (id) =>
    set((state) =>
      state.reviewedGameIds.includes(id)
        ? state
        : { reviewedGameIds: [...state.reviewedGameIds, id] }
    ),

  unmarkReviewed: (id) =>
    set((state) => ({ reviewedGameIds: state.reviewedGameIds.filter((g) => g !== id) })),
}));
