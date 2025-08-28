import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';
import { LoadingScreen } from './LoadingScreen';
import { Slot } from 'expo-router';

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <Slot />;
}