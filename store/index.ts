import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import gameSlice from './slices/gameSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    game: gameSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;