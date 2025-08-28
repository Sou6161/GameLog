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
}

const initialState: GameState = {
  currentGame: null,
  recentGames: [],
  trendingGames: [],
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
  },
});

export const { setCurrentGame, setRecentGames, setTrendingGames } = gameSlice.actions;
export default gameSlice.reducer;