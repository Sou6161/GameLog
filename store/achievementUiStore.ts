import { create } from 'zustand';
import type { Achievement } from '@/services/achievementService';

// Global queue of freshly-unlocked achievements waiting to be shown in the
// themed "Achievement Unlocked" modal. Unlocks can fire from anywhere (e.g. the
// review flow), so we push them here and render one shared modal at the root.
interface AchievementUiState {
  queue: Achievement[];
  current: Achievement | null;
  enqueue: (achievements: Achievement[]) => void;
  dismissCurrent: () => void;
}

export const useAchievementUiStore = create<AchievementUiState>((set, get) => ({
  queue: [],
  current: null,
  enqueue: (achievements) => {
    if (!achievements || achievements.length === 0) return;
    set((state) => {
      // If nothing is showing, promote the first and queue the rest.
      if (!state.current) {
        return { current: achievements[0], queue: [...state.queue, ...achievements.slice(1)] };
      }
      return { queue: [...state.queue, ...achievements] };
    });
  },
  dismissCurrent: () => {
    const { queue } = get();
    if (queue.length > 0) {
      set({ current: queue[0], queue: queue.slice(1) });
    } else {
      set({ current: null });
    }
  },
}));
