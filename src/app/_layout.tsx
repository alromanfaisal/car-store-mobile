// src/app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <CartProvider>
            <AnimatedSplashOverlay />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ title: 'Car Details' }} />
              <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
              <Stack.Screen name="orders" options={{ title: 'My Orders' }} />
            </Stack>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}