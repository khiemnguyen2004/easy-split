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
import { useProtectedRoute } from '../src/hooks/useProtectedRoute';
import { useThemeStore } from '../src/store/useThemeStore';
import { themeVars } from '../src/theme';
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
  const scheme = useThemeStore((s) => s.scheme);

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
          </Stack>
        </MeshBackground>
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

  useEffect(() => {
    useThemeStore.getState().hydrate();
  }, []);

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
