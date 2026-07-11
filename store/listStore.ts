import { create } from 'zustand';
import { ListService, GameList, ListGame } from '@/services/listService';

interface ListState {
  lists: GameList[];
  loading: boolean;
  fetchLists: () => Promise<void>;
  createList: (input: { name: string; description?: string; games?: ListGame[] }) => Promise<GameList>;
  updateList: (id: string, patch: { name?: string; description?: string; games?: ListGame[] }) => Promise<GameList>;
  deleteList: (id: string) => Promise<void>;
}

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  loading: false,

  fetchLists: async () => {
    set({ loading: true });
    try {
      set({ lists: await ListService.getLists() });
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      set({ loading: false });
    }
  },

  createList: async (input) => {
    const list = await ListService.createList(input);
    set((state) => ({ lists: [list, ...state.lists] }));
    return list;
  },

  updateList: async (id, patch) => {
    const list = await ListService.updateList(id, patch);
    set((state) => ({ lists: state.lists.map((l) => (l.id === id ? list : l)) }));
    return list;
  },

  deleteList: async (id) => {
    const previous = get().lists;
    set({ lists: previous.filter((l) => l.id !== id) });
    try {
      await ListService.deleteList(id);
    } catch (error) {
      set({ lists: previous }); // roll back so the UI doesn't lie
      throw error;
    }
  },
}));
