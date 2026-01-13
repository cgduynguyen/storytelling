import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../stores/authStore';

/**
 * Root layout for Expo Router
 *
 * This is the top-level layout that wraps all routes.
 * Providers:
 * - SafeAreaProvider: Ensures content doesn't overlap with system UI
 * - QueryClientProvider: TanStack Query for server state
 * - Auth initialization: Restore auth state from secure storage
 */
export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state on app launch
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Slot />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
