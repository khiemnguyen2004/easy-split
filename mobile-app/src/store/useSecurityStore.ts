import { create } from 'zustand';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import i18n from '../i18n';

// Lazy-load the native module so a dev client that hasn't been rebuilt yet (no
// ExpoLocalAuthentication binary) degrades gracefully instead of crashing the app.
let LocalAuthentication: typeof import('expo-local-authentication') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LocalAuthentication = require('expo-local-authentication');
} catch {
  LocalAuthentication = null;
}

/** Whether the biometric native module is present in this build. */
export const biometricAvailable = !!LocalAuthentication;

const STORAGE_KEY = 'easysplit.biometric';

interface SecurityState {
  /** Whether biometric app-lock is enabled by the user. */
  biometricEnabled: boolean;
  /** Whether the app is currently locked and must be unlocked to proceed. */
  locked: boolean;
  hydrated: boolean;
  /** Load the saved preference; lock immediately if enabled. Call once at start. */
  hydrate: () => Promise<void>;
  /** Turn the lock on/off. Enabling first verifies hardware + a live auth prompt. */
  setBiometricEnabled: (enabled: boolean) => Promise<boolean>;
  /** Run the biometric prompt; unlock on success. Returns whether it succeeded. */
  authenticate: () => Promise<boolean>;
}

let appStateSub: { remove: () => void } | null = null;

/**
 * Biometric app-lock preference + runtime lock state (mirrors the theme/language
 * store pattern). Persisted to SecureStore; re-locks whenever the app is
 * backgrounded so it requires Face ID / fingerprint again on return.
 */
export const useSecurityStore = create<SecurityState>((set, get) => ({
  biometricEnabled: false,
  locked: false,
  hydrated: false,
  hydrate: async () => {
    if (!appStateSub) {
      appStateSub = AppState.addEventListener('change', (next) => {
        if ((next === 'background' || next === 'inactive') && get().biometricEnabled) {
          set({ locked: true });
        }
      });
    }
    try {
      const saved = await SecureStore.getItemAsync(STORAGE_KEY);
      // Only honor the lock if the native module is actually available.
      const enabled = saved === '1' && !!LocalAuthentication;
      set({ biometricEnabled: enabled, locked: enabled, hydrated: true });
    } catch (e) {
      console.error('[Security] failed to load preference:', e);
      set({ hydrated: true });
    }
  },
  setBiometricEnabled: async (enabled) => {
    if (enabled) {
      if (!LocalAuthentication) return false;
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) return false;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: i18n.t('security.biometricPrompt'),
        cancelLabel: i18n.t('common.cancel'),
      });
      if (!result.success) return false;
    }
    set({ biometricEnabled: enabled, locked: false });
    SecureStore.setItemAsync(STORAGE_KEY, enabled ? '1' : '0').catch((e) =>
      console.error('[Security] failed to persist preference:', e)
    );
    return true;
  },
  authenticate: async () => {
    if (!LocalAuthentication) {
      set({ locked: false });
      return true;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: i18n.t('security.unlockPrompt'),
      cancelLabel: i18n.t('common.cancel'),
    });
    if (result.success) {
      set({ locked: false });
      return true;
    }
    return false;
  },
}));
