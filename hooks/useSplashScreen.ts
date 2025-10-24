import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export function useSplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Simulate app initialization time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, Platform.OS === 'web' ? 2000 : 3000); // Shorter on web, longer on mobile

    return () => {
      clearTimeout(timer);
    };
  }, []);
  return { isLoading };
}
