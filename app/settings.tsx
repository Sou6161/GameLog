import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQueryClient } from '@tanstack/react-query';
import { colors, gradients, alpha } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  User,
  GameController,
  Trash,
  Download,
  Eye,
  Lock,
  Question,
  Info,
  SignOut,
  Trophy,
  ArrowsClockwise,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, user, updateSettings, deleteAccount } = useAuth();
  const {
    userStats,
    achievements,
    resetAchievements,
    getUnlockedCount,
    getFavoriteGenres,
  } = useAchievements();

  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  // Privacy settings — backed by the server (source of truth is `user`).
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [showReviews, setShowReviews] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  // Statistics for display
  const [, setTotalAchievements] = useState(0);
  const [, setFavoriteGenres] = useState<string[]>([]);

  // Keep the local toggles in sync with the authenticated user.
  useEffect(() => {
    if (user) {
      setProfilePrivate(!!user.profilePrivate);
      setShowReviews(user.showReviews !== false);
      setShowActivity(user.showActivity !== false);
    }
  }, [user?.profilePrivate, user?.showReviews, user?.showActivity]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const count = await getUnlockedCount();
      const genres = await getFavoriteGenres(3);
      setTotalAchievements(count);
      setFavoriteGenres(genres);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Optimistically flip a privacy switch and persist it to the backend; revert
  // on failure so the UI never lies about what's actually saved.
  const makePrivacyHandler =
    (key: 'profilePrivate' | 'showReviews' | 'showActivity', setter: (v: boolean) => void) =>
    async (value: boolean) => {
      setter(value);
      try {
        await updateSettings({ [key]: value });
      } catch (error) {
        console.error('Failed to save privacy setting:', error);
        setter(!value);
        showConfirmation(
          'Update Failed',
          'Could not save your privacy setting. Check your connection and try again.',
          () => {},
          'warning',
          'OK',
          ''
        );
      }
    };

  const handleLogout = () => {
    showConfirmation(
      'Logout',
      'Are you sure you want to logout?',
      logout,
      'warning',
      'Logout',
      'Cancel'
    );
  };

  const handleDeleteAccount = () => {
    showConfirmation(
      'Delete Account',
      'This will permanently delete your account, all reviews, and votes. This action cannot be undone.',
      async () => {
        try {
          await deleteAccount();
          // deleteAccount clears the session; the auth guard redirects to login.
        } catch (error) {
          console.error('Delete account error:', error);
          showConfirmation(
            'Delete Failed',
            'Could not delete your account. Please check your connection and try again.',
            () => {},
            'warning',
            'OK',
            ''
          );
        }
      },
      'danger',
      'Delete Account',
      'Cancel'
    );
  };

  const handleExportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      const exportData = {
        exportDate: new Date().toISOString(),
        userStats,
        achievements,
        settings: Object.fromEntries(data.filter(([key]) => key.startsWith('@settings_'))),
        appVersion: '1.0.0',
      };

      await Share.share({
        message: `GameLog Data Export

Exported on: ${new Date().toLocaleDateString()}

Data: ${JSON.stringify(exportData, null, 2)}`,
        title: 'GameLog Data Export',
      });
    } catch (error) {
      showConfirmation(
        'Export Failed',
        'Failed to export your data. Please try again.',
        () => {},
        'warning',
        'OK',
        ''
      );
    }
  };

  const handleClearCache = () => {
    showConfirmation(
      'Clear Cache',
      'This clears cached game data so the app refetches fresh content. Your account and reviews are not affected.',
      async () => {
        try {
          // Drop React Query's cached network responses (game lists, search,
          // community reviews, profiles) so everything refetches fresh.
          queryClient.clear();
          showConfirmation(
            'Cache Cleared',
            'Cached game data has been cleared. Content will refresh as you browse.',
            () => {},
            'success',
            'OK',
            ''
          );
        } catch (error) {
          showConfirmation('Error', 'Failed to clear cache.', () => {}, 'warning', 'OK', '');
        }
      },
      'info',
      'Clear Cache',
      'Cancel'
    );
  };

  const handleResetAchievements = () => {
    showConfirmation(
      'Reset Achievements',
      'This will reset all your achievements and progress. This action cannot be undone.',
      async () => {
        await resetAchievements();
        await loadStats();
        showConfirmation(
          'Achievements Reset',
          'All achievements have been reset to locked state.',
          () => {},
          'success',
          'OK',
          ''
        );
      },
      'danger',
      'Reset All Achievements',
      'Cancel'
    );
  };

  const renderSettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showSwitch = false,
    switchValue = false,
    onSwitchChange = null,
    showArrow = true,
    destructive = false,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: ((value: boolean) => void) | null;
    showArrow?: boolean;
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 rounded-2xl mb-2.5"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: destructive ? alpha(colors.red, 0.4) : colors.border }}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={showSwitch}
    >
      <View className="flex-row items-center flex-1">
        <View
          className="w-11 h-11 rounded-2xl justify-center items-center mr-3"
          style={{ backgroundColor: destructive ? alpha(colors.red, 0.16) : alpha(colors.teal, 0.16) }}
        >
          <Icon size={20} color={destructive ? colors.red : colors.teal} weight="fill" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-base" style={{ color: destructive ? colors.red : colors.text }}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm mt-0.5" style={{ color: destructive ? alpha(colors.red, 0.8) : colors.textMuted }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View className="ml-3">
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.elevated, true: colors.teal }}
            thumbColor="#FFFFFF"
          />
        ) : showArrow ? (
          <View className="rotate-180">
            <ArrowLeft size={20} color={colors.textMuted} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3 px-1">
        <View className="w-1 h-4 rounded-full" style={{ backgroundColor: colors.teal }} />
        <Text className="font-bold text-lg" style={{ color: colors.text }}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <TouchableOpacity
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/profile');
              }
            }}
          >
            <ArrowLeft size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
          <Text className="font-bold text-xl" style={{ color: colors.text }}>Settings</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pb-8">
            {/* Privacy */}
            {renderSection({
              title: 'Privacy',
              children: (
                <>
                  {renderSettingItem({
                    icon: Lock,
                    title: 'Private Profile',
                    subtitle: profilePrivate ? 'Your profile is hidden from others' : 'Your profile is public',
                    showSwitch: true,
                    switchValue: profilePrivate,
                    onSwitchChange: makePrivacyHandler('profilePrivate', setProfilePrivate),
                  })}
                  {renderSettingItem({
                    icon: Eye,
                    title: 'Show Reviews Publicly',
                    subtitle: showReviews && !profilePrivate ? 'Others can see your reviews' : 'Reviews are hidden from others',
                    showSwitch: true,
                    switchValue: showReviews && !profilePrivate,
                    onSwitchChange: makePrivacyHandler('showReviews', setShowReviews),
                  })}
                  {renderSettingItem({
                    icon: GameController,
                    title: 'Show Gaming Activity',
                    subtitle: showActivity && !profilePrivate ? 'Others can see your gaming activity' : 'Activity is hidden from others',
                    showSwitch: true,
                    switchValue: showActivity && !profilePrivate,
                    onSwitchChange: makePrivacyHandler('showActivity', setShowActivity),
                  })}
                </>
              ),
            })}

            {/* Data & Storage */}
            {renderSection({
              title: 'Data & Storage',
              children: (
                <>
                  {renderSettingItem({
                    icon: Download,
                    title: 'Export My Data',
                    subtitle: 'Download backup of all your game data',
                    onPress: handleExportData,
                  })}
                  {renderSettingItem({
                    icon: ArrowsClockwise,
                    title: 'Clear App Cache',
                    subtitle: 'Free up storage space (keeps your data)',
                    onPress: handleClearCache,
                  })}
                </>
              ),
            })}

            {/* Gaming */}
            {renderSection({
              title: 'Gaming',
              children: (
                <>
                  {renderSettingItem({
                    icon: Trophy,
                    title: 'Reset All Achievements',
                    subtitle: 'Clear all unlocked achievements and progress',
                    onPress: handleResetAchievements,
                    destructive: true,
                  })}
                </>
              ),
            })}

            {/* Support */}
            {renderSection({
              title: 'Support',
              children: (
                <>
                  {renderSettingItem({
                    icon: Question,
                    title: 'Help & FAQ',
                    subtitle: 'Get help with using GameLog',
                    onPress: () =>
                      showConfirmation(
                        'GameLog Help',
                        'Frequently Asked Questions:\n\n• How do I add games to my library?\nTap any game and use "Add to Library" button\n\n• How do achievements work?\nThey unlock automatically as you use the app\n\n• How to write reviews?\nUse the Log tab to search and review games\n\n• How to create lists?\nGo to Lists tab and tap "Create New List"',
                        () => {},
                        'info',
                        'OK',
                        ''
                      ),
                  })}
                  {renderSettingItem({
                    icon: Info,
                    title: 'About GameLog',
                    subtitle: 'App version and information',
                    onPress: () =>
                      showConfirmation(
                        'About GameLog',
                        'GameLog v1.0.0\nBuild: 2024.12.01\n\nYour personal game tracking companion.\n\nTrack games, write reviews, unlock achievements, and organize your gaming library.\n\nDeveloped with ❤️ for gamers by gamers.',
                        () => {},
                        'info',
                        'OK',
                        ''
                      ),
                  })}
                </>
              ),
            })}

            {/* Account */}
            {renderSection({
              title: 'Account',
              children: (
                <>
                  {renderSettingItem({
                    icon: User,
                    title: 'View Profile',
                    subtitle: user?.username ? `Signed in as ${user.username}` : 'View and edit your profile',
                    onPress: () => router.push('/(tabs)/profile'),
                  })}
                  {renderSettingItem({
                    icon: SignOut,
                    title: 'Sign Out',
                    subtitle: 'Sign out of your GameLog account',
                    onPress: handleLogout,
                    destructive: true,
                  })}
                  {renderSettingItem({
                    icon: Trash,
                    title: 'Delete Account',
                    subtitle: 'Permanently delete account and all data',
                    onPress: handleDeleteAccount,
                    destructive: true,
                  })}
                </>
              ),
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationState.visible}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        type={confirmationState.type}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
      />
    </LinearGradient>
  );
}
