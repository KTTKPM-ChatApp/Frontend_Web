import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PresenceUpdatePayload {
  user_id: string;
  status: 'online' | 'offline';
  last_seen_at?: number;
  expires_at?: number;
  socket_count?: number;
  source?: string;
  trace_id?: string;
  version?: string;
}

interface PresenceState {
  presenceMap: Record<string, PresenceUpdatePayload>;
  updatePresence: (userId: string, payload: PresenceUpdatePayload) => void;
  removePresence: (userId: string) => void;
  reset: () => void;
}

export const usePresenceStore = create<PresenceState>()(
  persist(
    (set) => ({
      presenceMap: {},

      updatePresence: (userId: string, payload: PresenceUpdatePayload) => {
        set((state) => ({
          presenceMap: {
            ...state.presenceMap,
            [userId]: payload,
          },
        }));
      },

      removePresence: (userId: string) => {
        set((state) => {
          const newMap = { ...state.presenceMap };
          delete newMap[userId];
          return { presenceMap: newMap };
        });
      },

      reset: () => {
        set({ presenceMap: {} });
      },
    }),
    {
      name: 'presence-storage',
      partialize: (state) => ({ presenceMap: state.presenceMap }),
    }
  )
);
