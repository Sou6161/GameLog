import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '@/services/authService';
import { setUser, logout, setLoading } from '@/store/slices/authSlice';
import { RootState } from '@/store';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        dispatch(setUser({
          id: currentUser.$id,
          username: currentUser.name,
          email: currentUser.email,
        }));
      } else {
        dispatch(logout());
      }
    } catch (error) {
      dispatch(logout());
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      await authService.login({ email, password });
      await checkAuthStatus();
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      dispatch(setLoading(true));
      await authService.register({ email, password, username });
      await login(email, password);
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      dispatch(logout());
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