import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing configuration: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. API calls will fail.'
  );
}

const CHUNK_SIZE = 1900;
const CHUNK_META_SUFFIX = '__chunks';
const inMemoryStorage = new Map<string, string>();

async function readFromSecureStore(key: string): Promise<string | null> {
  const meta = await SecureStore.getItemAsync(`${key}${CHUNK_META_SUFFIX}`);
  if (meta) {
    const count = parseInt(meta, 10);
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}__${i}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  }
  return await SecureStore.getItemAsync(key);
}

async function writeToSecureStore(key: string, value: string): Promise<void> {
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    try {
      await SecureStore.deleteItemAsync(`${key}${CHUNK_META_SUFFIX}`);
    } catch {}
    return;
  }
  const chunkCount = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < chunkCount; i++) {
    await SecureStore.setItemAsync(
      `${key}__${i}`,
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    );
  }
  await SecureStore.setItemAsync(`${key}${CHUNK_META_SUFFIX}`, String(chunkCount));
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

async function deleteFromSecureStore(key: string): Promise<void> {
  const meta = await SecureStore.getItemAsync(`${key}${CHUNK_META_SUFFIX}`);
  if (meta) {
    const count = parseInt(meta, 10);
    for (let i = 0; i < count; i++) {
      try {
        await SecureStore.deleteItemAsync(`${key}__${i}`);
      } catch {}
    }
    try {
      await SecureStore.deleteItemAsync(`${key}${CHUNK_META_SUFFIX}`);
    } catch {}
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (inMemoryStorage.has(key)) {
      return inMemoryStorage.get(key) ?? null;
    }
    try {
      return await readFromSecureStore(key);
    } catch (e) {
      console.error('[Supabase Persistence] read failed:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await writeToSecureStore(key, value);
      inMemoryStorage.delete(key);
    } catch (e) {
      console.error('[Supabase Persistence] write failed; using in-memory fallback:', e);
      inMemoryStorage.set(key, value);
    }
  },
  removeItem: async (key: string) => {
    inMemoryStorage.delete(key);
    try {
      await deleteFromSecureStore(key);
    } catch (e) {
      console.error('[Supabase Persistence] delete failed:', e);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
