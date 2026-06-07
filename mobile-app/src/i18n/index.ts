/**
 * App localization (i18next + react-i18next).
 *
 * The instance is created synchronously with both bundled dictionaries so the
 * very first render already has strings. The active language is resolved once at
 * startup by `useLanguageStore.hydrate()` (saved preference → device locale).
 *
 * Usage:
 *  - Components: `const { t } = useTranslation();` then `t('home.totalBalance')`.
 *  - Non-components (hooks/services): import this default instance and call
 *    `i18n.t('createGroup.errFailed')`.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import vi from './locales/vi.json';

export const LANGUAGES = ['en', 'vi'] as const;
export type Language = (typeof LANGUAGES)[number];

/**
 * Best language for the current device: Vietnamese device → 'vi', else 'en'.
 * Reads the OS locale via the Hermes `Intl` API (e.g. "vi-VN", "en-US") so no
 * native module / dev-client rebuild is required.
 */
export const deviceLanguage = (): Language => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    return locale.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  } catch {
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
