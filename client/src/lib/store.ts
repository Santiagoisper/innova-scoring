import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserSession {
  id: string;
  name: string;
  role: "admin" | "site";
  siteId?: string;
  email?: string;
  permission?: "readonly" | "readwrite";
}

interface AppState {
  user: UserSession | null;
  darkMode: boolean;
  login: (user: UserSession) => void;
  logout: () => void;
  toggleDarkMode: () => void;
}

function applyDarkMode(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      darkMode: false,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      toggleDarkMode: () => {
        const newVal = !get().darkMode;
        applyDarkMode(newVal);
        set({ darkMode: newVal });
      },
    }),
    {
      name: 'innova-trials-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          applyDarkMode(true);
        }
      },
    }
  )
);
