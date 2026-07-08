import { useEffect } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logoutStore = useAuthStore((s) => s.logout);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.$id,
          username: currentUser.name,
          email: currentUser.email,
        });
      } else {
        logoutStore();
      }
    } catch (error) {
      logoutStore();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.login({ email, password });
      await checkAuthStatus();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      await authService.register({ email, password, username });
      await login(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      logoutStore();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: signOut,
  };
}
