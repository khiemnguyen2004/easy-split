import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

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
  signOut: () => set({ session: null, user: null }),
}));
