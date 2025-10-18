import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Game {
  id: string;
  igdbId: number;
  title: string;
  coverUrl?: string;
  releaseDate?: string;
  rating?: number;
  platforms: string[];
  genres: string[];
}

interface GameState {
  currentGame: Game | null;
  recentGames: Game[];
  trendingGames: Game[];
  libraryGames: Array<{ id: string; title: string; coverUrl?: string; genre?: string; addedDate?: string }>; 
  reviewedGameIds: string[];
}

const initialState: GameState = {
  currentGame: null,
  recentGames: [],
  trendingGames: [],
  libraryGames: [],
  reviewedGameIds: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentGame: (state, action: PayloadAction<Game>) => {
      state.currentGame = action.payload;
    },
    setRecentGames: (state, action: PayloadAction<Game[]>) => {
      state.recentGames = action.payload;
    },
    setTrendingGames: (state, action: PayloadAction<Game[]>) => {
      state.trendingGames = action.payload;
    },
    addToLibrary: (state, action: PayloadAction<{ id: string; title: string; coverUrl?: string; genre?: string; addedDate?: string }>) => {
      const exists = state.libraryGames.some(g => g.id === action.payload.id);
      if (!exists) {
        state.libraryGames.push(action.payload);
      }
    },
    removeFromLibrary: (state, action: PayloadAction<string>) => {
      state.libraryGames = state.libraryGames.filter(g => g.id !== action.payload);
    },
    markReviewed: (state, action: PayloadAction<string>) => {
      if (!state.reviewedGameIds.includes(action.payload)) {
        state.reviewedGameIds.push(action.payload);
      }
    },
    unmarkReviewed: (state, action: PayloadAction<string>) => {
      state.reviewedGameIds = state.reviewedGameIds.filter(id => id !== action.payload);
    },
  },
});

export const { setCurrentGame, setRecentGames, setTrendingGames, addToLibrary, removeFromLibrary, markReviewed, unmarkReviewed } = gameSlice.actions;
export default gameSlice.reducer;