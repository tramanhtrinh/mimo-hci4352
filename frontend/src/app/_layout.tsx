import { Gaegu_400Regular, Gaegu_700Bold, useFonts } from '@expo-google-fonts/gaegu';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { Palette } from '@/constants/theme';
import { AuthProvider } from '@/state/auth';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Palette.paper,
    card: Palette.paper,
    text: Palette.ink,
    border: Palette.shade,
    primary: Palette.ink,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Gaegu_400Regular, Gaegu_700Bold });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.paper } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
