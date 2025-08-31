import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Orbitron_400Regular,
  Orbitron_700Bold,
  Orbitron_900Black,
} from '@expo-google-fonts/orbitron';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Audiowide_400Regular } from '@expo-google-fonts/audiowide';
import { SplashScreen } from 'expo-router';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import '../global.css';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthScreen } from '@/components/AuthScreen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Orbitron_400Regular': Orbitron_400Regular,
    'Orbitron_700Bold': Orbitron_700Bold,
    'Orbitron_900Black': Orbitron_900Black,
    'Inter_400Regular': Inter_400Regular,
    'Inter_500Medium': Inter_500Medium,
    'Inter_700Bold': Inter_700Bold,
    'Audiowide_400Regular': Audiowide_400Regular,
  });

  // Hide native splash screen immediately when fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show our custom splash screen for the full animation duration
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Wait for full animation: entrance(0.6s) + glow(0.4s) + 1 pulse(2s) = ~2s
      const timer = setTimeout(() => setShowCustomSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          {showCustomSplash ? <LoadingScreen /> : <AuthGate />}
          <StatusBar style="light" />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}