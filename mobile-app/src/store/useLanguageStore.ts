import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import i18n, { Language, deviceLanguage } from '../i18n';

const STORAGE_KEY = 'easysplit.language';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export const languageLabel = (lng: Language) => LANGUAGE_LABELS[lng];

interface LanguageState {
  /** Active language code applied to the UI. */
  language: Language;
  hydrated: boolean;
  /** Apply + persist a new language. */
  setLanguage: (lng: Language) => void;
  /** Load the saved language (falling back to device locale) and apply it. */
  hydrate: () => Promise<void>;
}

/**
 * Language preference — a thin store over the i18next instance so the UI can
 * read/select the language reactively (mirrors `useThemeStore`). `setLanguage`
 * keeps i18next and this store in sync; `t()` consumers re-render via i18next.
 * Persisted to SecureStore; defaults to the device locale on first launch.
 */
export const useLanguageStore = create<LanguageState>((set) => ({
  language: (i18n.language as Language) || 'en',
  hydrated: false,
  setLanguage: (language) => {
    set({ language });
    i18n.changeLanguage(language);
    SecureStore.setItemAsync(STORAGE_KEY, language).catch((e) =>
      console.error('[i18n] failed to persist language:', e)
    );
  },
  hydrate: async () => {
    try {
      const saved = (await SecureStore.getItemAsync(STORAGE_KEY)) as Language | null;
      const language: Language = saved === 'en' || saved === 'vi' ? saved : deviceLanguage();
      i18n.changeLanguage(language);
      set({ language, hydrated: true });
    } catch (e) {
      console.error('[i18n] failed to load language:', e);
      set({ hydrated: true });
    }
  },
}));
