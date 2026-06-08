import { create } from 'zustand';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'easysplit.theme-mode';

/** Effective light/dark scheme for a mode ('system' resolves via the OS). */
const resolveScheme = (mode: ThemeMode): ColorScheme => {
  if (mode !== 'system') return mode;
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
};

interface ThemeState {
  mode: ThemeMode;
  /** Resolved scheme actually applied to the UI ('system' → OS appearance). */
  scheme: ColorScheme;
  hydrated: boolean;
  /** Apply + persist a new theme mode. */
  setMode: (mode: ThemeMode) => void;
  /** Load the saved mode from storage and apply it. Call once at app start. */
  hydrate: () => Promise<void>;
}

let appearanceSub: { remove: () => void } | null = null;

/**
 * App theme preference (light / dark / system) — the single source of truth for
 * theming. `scheme` is the resolved light/dark value; the UI reads it to pick
 * CSS variables (via `themeVars`) and JS color props (via `useThemeColors`).
 * Persisted to SecureStore; tracks OS appearance changes while in 'system'.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  scheme: resolveScheme('system'),
  hydrated: false,
  setMode: (mode) => {
    set({ mode, scheme: resolveScheme(mode) });
    SecureStore.setItemAsync(STORAGE_KEY, mode).catch((e) =>
      console.error('[Theme] failed to persist mode:', e)
    );
  },
  hydrate: async () => {
    if (!appearanceSub) {
      appearanceSub = Appearance.addChangeListener(() => {
        if (get().mode === 'system') set({ scheme: resolveScheme('system') });
      });
    }
    try {
      const saved = (await SecureStore.getItemAsync(STORAGE_KEY)) as ThemeMode | null;
      const mode: ThemeMode =
        saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      set({ mode, scheme: resolveScheme(mode), hydrated: true });
    } catch (e) {
      console.error('[Theme] failed to load mode:', e);
      set({ hydrated: true });
    }
  },
}));
