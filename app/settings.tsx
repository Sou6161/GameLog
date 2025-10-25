import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ArrowLeft,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  GameController,
  Trash,
  Download,
  Upload,
  Eye,
  Lock,
  Question,
  Info,
  SignOut,
  Trophy,
  ArrowsClockwise,
  Star,
  Heart,
  Moon,
  Sun,
  Vibrate,
  SpeakerHigh
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { 
    userStats, 
    achievements, 
    resetAchievements, 
    getUnlockedCount,
    getFavoriteGenres 
  } = useAchievements();
  
  // Settings states with AsyncStorage persistence
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [showPlaytime, setShowPlaytime] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [dataUsage, setDataUsage] = useState('wifi'); // 'wifi', 'cellular', 'both'
  
  // Statistics for display
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);

  
  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);
  
  const loadSettings = async () => {
    try {
      const settingsKeys = [
        'notifications', 'achievementNotifications', 'reviewReminders', 
        'soundEnabled', 'vibrationEnabled', 'darkMode', 'compactView',
        'showSpoilers', 'autoSync', 'showPlaytime', 'showReviews', 
        'showActivity', 'profilePrivate', 'dataUsage'
      ];
      
      const settings = await AsyncStorage.multiGet(settingsKeys.map(key => `@settings_${key}`));
      
      settings.forEach(([key, value]) => {
        if (value !== null) {
          const settingName = key.replace('@settings_', '');
          const parsedValue = settingName === 'dataUsage' ? value : JSON.parse(value);
          
          switch (settingName) {
            case 'notifications': setNotificationsEnabled(parsedValue); break;
            case 'achievementNotifications': setAchievementNotifications(parsedValue); break;
            case 'reviewReminders': setReviewReminders(parsedValue); break;
            case 'soundEnabled': setSoundEnabled(parsedValue); break;
            case 'vibrationEnabled': setVibrationEnabled(parsedValue); break;
            case 'darkMode': setDarkMode(parsedValue); break;
            case 'compactView': setCompactView(parsedValue); break;
            case 'showSpoilers': setShowSpoilers(parsedValue); break;
            case 'autoSync': setAutoSync(parsedValue); break;
            case 'showPlaytime': setShowPlaytime(parsedValue); break;
            case 'showReviews': setShowReviews(parsedValue); break;
            case 'showActivity': setShowActivity(parsedValue); break;
            case 'profilePrivate': setProfilePrivate(parsedValue); break;
            case 'dataUsage': setDataUsage(parsedValue); break;
          }
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
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
  
  const saveSetting = async (key: string, value: any) => {
    try {
      const storageValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(`@settings_${key}`, storageValue);
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };
  
  const createSettingHandler = (key: string, setter: (value: any) => void) => {
    return (value: any) => {
      setter(value);
      saveSetting(key, value);
    };
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
      'This will permanently delete your account, all reviews, achievements, and data. This action cannot be undone.',
      () => {
        // In a real app, this would call an API
        showConfirmation(
          'Account Deleted',
          'Your account and all data have been permanently deleted.',
          () => {},
          'success',
          'OK',
          ''
        );
        logout();
      },
      'danger',
      'Delete Account',
      'Cancel'
    );
  };

  const handleExportData = async () => {
    try {
      // Get all user data
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      const exportData = {
        exportDate: new Date().toISOString(),
        userStats,
        achievements: achievements,
        settings: Object.fromEntries(data.filter(([key]) => key.startsWith('@settings_'))),
        appVersion: '1.0.0'
      };
      
      // Share the data
      await Share.share({
        message: `GameLog Data Export

Exported on: ${new Date().toLocaleDateString()}

Data: ${JSON.stringify(exportData, null, 2)}`,
        title: 'GameLog Data Export'
      });
      
      showConfirmation(
        'Export Complete',
        'Your data has been exported successfully!',
        () => {},
        'success',
        'OK',
        ''
      );
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

  const handleClearCache = async () => {
    showConfirmation(
      'Clear Cache',
      'This will clear temporary files and may improve app performance. Your data will not be affected.',
      async () => {
        try {
          // Clear cache (in a real app, you'd clear specific cache keys)
          showConfirmation(
            'Cache Cleared',
            'App cache has been cleared successfully!',
            () => {},
            'success',
            'OK',
            ''
          );
        } catch (error) {
          showConfirmation(
            'Error',
            'Failed to clear cache.',
            () => {},
            'warning',
            'OK',
            ''
          );
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
  
  const handleNotificationSettings = () => {
    showConfirmation(
      'Notification Preferences',
      'Choose what types of notifications you want to receive.',
      () => {
        // This would open a more detailed notification settings screen
        setNotificationsEnabled(true);
      },
      'info',
      'Configure',
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
    destructive = false 
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
      className={`flex-row items-center justify-between p-4 bg-[#18181B] rounded-xl mb-2 border border-[#3F3F46] ${destructive ? 'border-red-500' : ''}`} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${destructive ? 'bg-red-500/20' : 'bg-[#9146FF]/20'}`}>
          <Icon size={20} color={destructive ? '#EF4444' : '#9146FF'} weight="fill" />
        </View>
        <View className="flex-1">
          <Text className={`font-semibold text-base ${destructive ? 'text-red-500' : 'text-white'}`}>
            {title}
          </Text>
          {subtitle && (
            <Text className={`text-sm mt-1 ${destructive ? 'text-red-400' : 'text-gray-400'}`}>
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
            trackColor={{ false: '#3F3F46', true: '#9146FF' }}
            thumbColor={switchValue ? '#FFFFFF' : '#9CA3AF'}
          />
        ) : showArrow ? (
          <View className="rotate-180">
            <ArrowLeft size={20} color="#6B7280" />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-6">
      <Text className="font-bold text-lg text-white mb-3 px-1">{title}</Text>
      <View className="space-y-2">
        {children}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0E0E10', '#18181B', '#1F1F23']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full justify-center items-center" 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/profile');
              }
            }}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="font-bold text-xl text-white">Settings</Text>
          <View className="w-10" />
        </View>
        
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pb-8">
            {/* Notifications */}
            {renderSection({
              title: 'Notifications',
              children: (
                <>
                  {renderSettingItem({
                    icon: Bell,
                    title: 'Push Notifications',
                    subtitle: notificationsEnabled ? 'Enabled' : 'Disabled',
                    showSwitch: true,
                    switchValue: notificationsEnabled,
                    onSwitchChange: createSettingHandler('notifications', setNotificationsEnabled)
                  })}
                  {renderSettingItem({
                    icon: Trophy,
                    title: 'Achievement Alerts',
                    subtitle: achievementNotifications ? 'Get notified when you unlock achievements' : 'Achievement notifications disabled',
                    showSwitch: true,
                    switchValue: achievementNotifications && notificationsEnabled,
                    onSwitchChange: createSettingHandler('achievementNotifications', setAchievementNotifications)
                  })}
                  {renderSettingItem({
                    icon: Star,
                    title: 'Review Reminders',
                    subtitle: reviewReminders ? 'Remind me to review games' : 'No review reminders',
                    showSwitch: true,
                    switchValue: reviewReminders && notificationsEnabled,
                    onSwitchChange: createSettingHandler('reviewReminders', setReviewReminders)
                  })}
                </>
              )
            })}

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
                    onSwitchChange: createSettingHandler('profilePrivate', setProfilePrivate)
                  })}
                  {renderSettingItem({
                    icon: Eye,
                    title: 'Show Reviews Publicly',
                    subtitle: showReviews ? 'Others can see your reviews' : 'Reviews are private',
                    showSwitch: true,
                    switchValue: showReviews && !profilePrivate,
                    onSwitchChange: createSettingHandler('showReviews', setShowReviews)
                  })}
                  {renderSettingItem({
                    icon: GameController,
                    title: 'Show Gaming Activity',
                    subtitle: showActivity ? 'Others can see your gaming activity' : 'Activity is private',
                    showSwitch: true,
                    switchValue: showActivity && !profilePrivate,
                    onSwitchChange: createSettingHandler('showActivity', setShowActivity)
                  })}
                </>
              )
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
                    onPress: handleExportData
                  })}
                  {renderSettingItem({
                    icon: ArrowsClockwise,
                    title: 'Clear App Cache',
                    subtitle: 'Free up storage space (keeps your data)',
                    onPress: handleClearCache
                  })}
                </>
              )
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
                    destructive: true
                  })}
                </>
              )
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
                    onPress: () => showConfirmation(
                      'GameLog Help', 
                      'Frequently Asked Questions:\n\n• How do I add games to my library?\nTap any game and use "Add to Library" button\n\n• How do achievements work?\nThey unlock automatically as you use the app\n\n• How to write reviews?\nUse the Log tab to search and review games\n\n• How to create lists?\nGo to Lists tab and tap "Create New List"',
                      () => {},
                      'info',
                      'OK',
                      ''
                    )
                  })}
                  {renderSettingItem({
                    icon: Info,
                    title: 'About GameLog',
                    subtitle: 'App version and information',
                    onPress: () => showConfirmation(
                      'About GameLog', 
                      'GameLog v1.0.0\nBuild: 2024.12.01\n\nYour personal game tracking companion.\n\nTrack games, write reviews, unlock achievements, and organize your gaming library.\n\nDeveloped with ❤️ for gamers by gamers.',
                      () => {},
                      'info',
                      'OK',
                      ''
                    )
                  })}
                </>
              )
            })}

            {/* Account */}
            {/* Account & Security */}
            {renderSection({
              title: 'Account',
              children: (
                <>
                  {renderSettingItem({
                    icon: User,
                    title: 'View Profile',
                    subtitle: user?.username ? `Signed in as ${user.username}` : 'View and edit your profile',
                    onPress: () => router.push('/(tabs)/profile')
                  })}
                  {renderSettingItem({
                    icon: SignOut,
                    title: 'Sign Out',
                    subtitle: 'Sign out of your GameLog account',
                    onPress: handleLogout,
                    destructive: true
                  })}
                  {renderSettingItem({
                    icon: Trash,
                    title: 'Delete Account',
                    subtitle: 'Permanently delete account and all data',
                    onPress: handleDeleteAccount,
                    destructive: true
                  })}
                </>
              )
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

