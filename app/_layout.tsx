import { useEffect } from 'react';
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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../global.css';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/AuthScreen';
import SplashScreen from '@/components/SplashScreen';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import AchievementUnlockedModal from '@/components/AchievementUnlockedModal';


const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoading: isSplashLoading } = useSplashScreen();

  // Show splash screen first - this should always show regardless of auth state
  if (isSplashLoading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  // After splash screen, check authentication
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Smooth iOS-style slide for push/pop on all platforms + edge-swipe back.
        animation: 'slide_from_right',
        animationDuration: 260,
        gestureEnabled: true,
        // Dark scene background so there's no white flash during transitions.
        contentStyle: { backgroundColor: '#0A0E13' },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  // Keep the whole app in portrait; only the fullscreen video player unlocks to
  // landscape (see MediaPlayerModal). Guarded so it no-ops if the native module
  // isn't in the build yet.
  useEffect(() => {
    (async () => {
      try {
        const ScreenOrientation = await import('expo-screen-orientation');
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch {}
    })();
  }, []);

  // Paint the native root/window background dark so screen transitions never
  // flash white. Guarded so a missing module can't block startup.
  useEffect(() => {
    (async () => {
      try {
        const SystemUI = await import('expo-system-ui');
        await SystemUI.setBackgroundColorAsync('#0A0E13');
      } catch {}
    })();
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'Orbitron_400Regular': Orbitron_400Regular,
    'Orbitron_700Bold': Orbitron_700Bold,
    'Orbitron_900Black': Orbitron_900Black,
    'Inter_400Regular': Inter_400Regular,
    'Inter_500Medium': Inter_500Medium,
    'Inter_700Bold': Inter_700Bold,
    'Audiowide_400Regular': Audiowide_400Regular,
  });



  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthGate />
        <AchievementUnlockedModal />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}