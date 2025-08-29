import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';
import { LoadingScreen } from './LoadingScreen';
import { Slot } from 'expo-router';

export interface AppContentProps {
  children?: React.ReactNode;
}

export function AppContent({ children }: AppContentProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return children ? <>{children}</> : <Slot />;
}

export default AppContent;