import { create } from 'zustand';
import {
  getSecure,
  saveSecure,
  clearSecureStorage,
  hasAuthTokens,
} from '../lib/secureStorage';

/**
 * Auth store using Zustand
 *
 * Manages authentication state and user session
 * Persists tokens in secure storage
 */

export interface User {
  id: string;
  email: string;
  name: string;
  childName?: string;
  parentalPinSet?: boolean;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Set user data
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Set authentication tokens
  setTokens: async (accessToken, refreshToken) => {
    try {
      await saveSecure('ACCESS_TOKEN', accessToken);
      await saveSecure('REFRESH_TOKEN', refreshToken);
      set({ isAuthenticated: true });
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await clearSecureStorage();
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw error;
    }
  },

  // Initialize auth state from secure storage
  initialize: async () => {
    set({ isLoading: true });

    try {
      const hasTokens = await hasAuthTokens();
      const userId = await getSecure('USER_ID');

      if (hasTokens && userId) {
        // User has valid tokens - fetch user data from API
        // This will be implemented when we create the auth hooks
        set({
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Check if user is authenticated
  checkAuth: async () => {
    const hasTokens = await hasAuthTokens();
    set({ isAuthenticated: hasTokens });
    return hasTokens;
  },
}));
