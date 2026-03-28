import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ADMIN_PASSWORD = 'casadoce@2025';

interface AuthStore {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      login: (password: string) => {
        if (password === ADMIN_PASSWORD) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'casadoce-auth',
    }
  )
);
