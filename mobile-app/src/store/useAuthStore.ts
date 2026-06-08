import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  setAuth: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  setAuth: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  // Clear local state immediately (so the redirect to login is instant) and
  // invalidate the Supabase session in the background.
  signOut: () => {
    set({ session: null, user: null });
    supabase.auth.signOut().catch((e) => console.error('[Auth] signOut failed:', e));
  },
}));
