import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@storyteller/shared';

/**
 * Auth hooks using TanStack Query + Zustand
 *
 * Provides hooks for login, register, and logout operations
 */

/**
 * Hook to handle user login
 */
export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      );
      return response.data;
    },
    onSuccess: async (data) => {
      // Save tokens to secure storage
      await setTokens(data.accessToken, data.refreshToken);
      // Update user state with childName mapping
      setUser({
        ...data.user,
        childName: data.user.name,
        parentalPinSet: false,
      });
      // Invalidate all queries on login to ensure fresh data
      queryClient.invalidateQueries();
    },
  });
};

/**
 * Hook to handle user registration
 */
export const useRegister = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        data
      );
      return response.data;
    },
    onSuccess: async (data) => {
      // Save tokens to secure storage
      await setTokens(data.accessToken, data.refreshToken);
      // Update user state with childName mapping
      setUser({
        ...data.user,
        childName: data.user.name,
        parentalPinSet: false,
      });
      // Invalidate all queries on registration
      queryClient.invalidateQueries();
    },
  });
};

/**
 * Hook to handle user logout
 */
export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        // Call logout endpoint (optional - backend can revoke token)
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn(
          'Logout API call failed, continuing with local logout',
          error
        );
      }
    },
    onSuccess: async () => {
      // Clear auth state and secure storage
      await logout();
      // Clear all cached queries
      queryClient.clear();
    },
  });
};

/**
 * Hook to refresh access token
 */
export const useRefreshToken = () => {
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/refresh', { refreshToken });
      return response.data;
    },
    onSuccess: async (data) => {
      await setTokens(data.accessToken, data.refreshToken);
    },
  });
};
