import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi, getErrorMessage } from '@/services/api';
import type { User } from '@/types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

/**
 * Hook for authentication operations
 * Integrates with authStore for state management
 */
export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    logout: logoutStore,
  } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);
      const { token, refreshToken, user: userData } = response.data;

      // Store tokens
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);

      // Update store
      setUser(userData);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register(name, email, password);
      const { token, refreshToken, user: userData } = response.data;

      // Store tokens
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);

      // Update store
      setUser(userData);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  const logout = useCallback(() => {
    // Clear tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');

    // Clear store
    logoutStore();

    // TODO: Call logout endpoint if needed
  }, [logoutStore]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
