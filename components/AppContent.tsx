import React, { JSX } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';
import { Slot } from 'expo-router';

export interface AppContentProps {
  children?: React.ReactNode;
}

export function AppContent({ children }: AppContentProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <></>;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return children ? <>{children}</> : <Slot />;
}

export default AppContent;