import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import '../global.css';
import '../src/i18n';
import { useProtectedRoute } from '../src/hooks/useProtectedRoute';
import { useThemeStore } from '../src/store/useThemeStore';
import { useLanguageStore } from '../src/store/useLanguageStore';
import { useSecurityStore } from '../src/store/useSecurityStore';
import { themeVars } from '../src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

import { MeshBackground } from '../src/components/ui/MeshBackground';
import { LockScreen } from '../src/components/LockScreen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden during dev hot-reload; safe to ignore.
});

cssInterop(LinearGradient, {
  className: 'style',
});

function RootLayoutNav() {
  useProtectedRoute();
  const scheme = useThemeStore((s) => s.scheme);
  const locked = useSecurityStore((s) => s.locked);

  const NavTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <ThemeProvider value={NavTheme}>
      {/* Root vars() sets the theme CSS variables for the whole tree. */}
      <View style={themeVars[scheme]} className="flex-1">
        <MeshBackground>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)/register" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="group/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </MeshBackground>
        {locked ? <LockScreen /> : null}
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  const securityHydrated = useSecurityStore((s) => s.hydrated);

  useEffect(() => {
    useThemeStore.getState().hydrate();
    useLanguageStore.getState().hydrate();
    useSecurityStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if ((loaded || error) && securityHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, securityHydrated]);

  // Wait for fonts AND the security store so the lock is applied before first
  // paint (avoids a flash of app content when the lock is enabled).
  if ((!loaded && !error) || !securityHydrated) {
    return null;
  }

  return <RootLayoutNav />;
}
