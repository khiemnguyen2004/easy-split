import { Stack } from 'expo-router';
import { useEffect } from 'react';
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
import { useProtectedRoute } from '../src/hooks/useProtectedRoute';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

import { MeshBackground } from '../src/components/ui/MeshBackground';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden during dev hot-reload; safe to ignore.
});

cssInterop(LinearGradient, {
  className: 'style',
});

function RootLayoutNav() {
  useProtectedRoute();

  const NavTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <ThemeProvider value={NavTheme}>
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
        </Stack>
      </MeshBackground>
      <StatusBar style="dark" />
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

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}
