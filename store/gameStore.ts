import { create } from 'zustand';

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

export interface LibraryGame {
  id: string;
  title: string;
  coverUrl?: string;
  genre?: string;
  addedDate?: string;
}

interface GameState {
  currentGame: Game | null;
  recentGames: Game[];
  trendingGames: Game[];
  libraryGames: LibraryGame[];
  reviewedGameIds: string[];
  setCurrentGame: (game: Game) => void;
  setRecentGames: (games: Game[]) => void;
  setTrendingGames: (games: Game[]) => void;
  addToLibrary: (game: LibraryGame) => void;
  removeFromLibrary: (id: string) => void;
  markReviewed: (id: string) => void;
  unmarkReviewed: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  recentGames: [],
  trendingGames: [],
  libraryGames: [],
  reviewedGameIds: [],

  setCurrentGame: (game) => set({ currentGame: game }),
  setRecentGames: (games) => set({ recentGames: games }),
  setTrendingGames: (games) => set({ trendingGames: games }),

  addToLibrary: (game) =>
    set((state) =>
      state.libraryGames.some((g) => g.id === game.id)
        ? state
        : { libraryGames: [...state.libraryGames, game] }
    ),

  removeFromLibrary: (id) =>
    set((state) => ({ libraryGames: state.libraryGames.filter((g) => g.id !== id) })),

  markReviewed: (id) =>
    set((state) =>
      state.reviewedGameIds.includes(id)
        ? state
        : { reviewedGameIds: [...state.reviewedGameIds, id] }
    ),

  unmarkReviewed: (id) =>
    set((state) => ({ reviewedGameIds: state.reviewedGameIds.filter((g) => g !== id) })),
}));
