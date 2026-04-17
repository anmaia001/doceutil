import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  isAuthenticated: false,
  loading: true,

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { ok: false, error: 'E-mail ou senha incorretos.' };
    }
    set({ isAuthenticated: true });
    return { ok: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false });
  },

  checkSession: async () => {
    const { data } = await supabase.auth.getSession();
    set({ isAuthenticated: !!data.session, loading: false });

    // Escutar mudanças de sessão em tempo real
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ isAuthenticated: !!session, loading: false });
    });
  },
}));
