import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function useProtectedRoute() {
  const { setAuth, session } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        console.log('[Auth Debug] Loaded session:', !!session);
        setAuth(session);
      })
      .catch((e) => {
        console.error('[Auth] getSession failed:', e);
      })
      .finally(() => {
        if (!cancelled) {
          console.log('[Auth Debug] Setting isReady to true');
          setIsReady(true);
        }
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth Debug] Auth state changed:', !!session);
      setAuth(session);
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [setAuth]);

  useEffect(() => {
    const navReady = !!rootNavigationState?.key;
    console.log('[Auth Debug] Check redirect:', {
      isReady,
      navReady,
      hasSession: !!session,
      segments,
    });

    if (!isReady || !navReady) return;

    const segmentsArray = segments as string[];
    const inAuthGroup = segmentsArray[0] === '(auth)';
    const atRoot = segmentsArray.length === 0 || segmentsArray[0] === '';

    if (!session && !inAuthGroup) {
      console.log('[Auth Debug] Redirecting to login');
      router.replace('/(auth)/login');
    } else if (session && (inAuthGroup || atRoot)) {
      console.log('[Auth Debug] Redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isReady, session, segments, router, rootNavigationState?.key]);

  return { session, isReady };
}
