import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';
import { achievementService } from '@/services/achievementService';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useReviewStore } from '@/store/reviewStore';
import { useListStore } from '@/store/listStore';

// Achievements, stats and bio live on the DEVICE (AsyncStorage), not per-account.
// Without this, signing out and into a different account inherits the previous
// user's counters — which is how a brand-new account showed "4 games, 1 review".
async function clearLocalUserData() {
  try {
    await achievementService.resetAchievements();
    await AsyncStorage.removeItem('user_bio');
    useGameStore.setState({ libraryGames: [] });
    useReviewStore.setState({ reviews: [] });
    useListStore.setState({ lists: [] });
  } catch (error) {
    console.error('Failed to clear local user data:', error);
  }
}

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
          avatar: currentUser.avatar,
          createdAt: currentUser.createdAt,
          profilePrivate: currentUser.profilePrivate,
          showReviews: currentUser.showReviews,
          showActivity: currentUser.showActivity,
        });
      } else {
        // No token or the token was rejected (401) — genuinely logged out.
        logoutStore();
      }
    } catch (error) {
      // Transient failure (server restarting, network blip). Do NOT log out an
      // already-authenticated user; just stop the initial loading state.
      console.warn('Auth check failed (keeping current session):', error);
      if (useAuthStore.getState().user) {
        setLoading(false);
      } else {
        logoutStore();
      }
    }
  };

  const applyUser = (u: {
    $id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt?: string;
    profilePrivate?: boolean;
    showReviews?: boolean;
    showActivity?: boolean;
  }) =>
    setUser({
      id: u.$id,
      username: u.name,
      email: u.email,
      avatar: u.avatar,
      createdAt: u.createdAt,
      profilePrivate: u.profilePrivate,
      showReviews: u.showReviews,
      showActivity: u.showActivity,
    });

  // Persist privacy settings and refresh the store.
  const updateSettings = async (patch: {
    profilePrivate?: boolean;
    showReviews?: boolean;
    showActivity?: boolean;
  }) => {
    const updated = await authService.updateProfile(patch);
    applyUser(updated);
    return updated;
  };

  // Permanently delete the account, then clear local session.
  const deleteAccount = async () => {
    await authService.deleteAccount();
    logoutStore();
    await clearLocalUserData();
  };

  // Persist an avatar URL (e.g. a preset) and refresh the store.
  const saveAvatarUrl = async (url: string) => {
    const updated = await authService.updateProfile({ avatarUrl: url });
    applyUser(updated);
    return url;
  };

  // Upload a new avatar image (data URI), persist it, and refresh the store.
  const updateAvatar = async (dataUri: string) => {
    const url = await authService.uploadImage(dataUri, 'avatar');
    return saveAvatarUrl(url);
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
      await clearLocalUserData();
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
    updateAvatar,
    saveAvatarUrl,
    updateSettings,
    deleteAccount,
  };
}
