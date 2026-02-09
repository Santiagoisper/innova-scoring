import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserSession {
  id: string;
  name: string;
  role: "admin" | "site";
  siteId?: string;
  permission?: "readonly" | "readwrite";
}

interface AppState {
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'innova-trials-auth',
    }
  )
);
