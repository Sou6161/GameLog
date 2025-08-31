import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  GameController,
  SteamLogo,
  Trash,
  Download,
  Upload,
  Eye,
  Lock,
  Key,
  Question,
  Info,
  SignOut
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  
  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [showPlaytime, setShowPlaytime] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [steamConnected, setSteamConnected] = useState(false);
  const [playstationConnected, setPlaystationConnected] = useState(false);
  const [xboxConnected, setXboxConnected] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Account Deleted', 'Your account has been deleted.');
        }}
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data will be exported to your email address.');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'Select a file to import your data.');
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
      style={[styles.settingItem, destructive && styles.settingItemDestructive]} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, destructive && styles.settingIconDestructive]}>
          <Icon size={20} color={destructive ? '#EF4444' : '#865EF6'} weight="fill" />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, destructive && styles.settingTitleDestructive]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, destructive && styles.settingSubtitleDestructive]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#374151', true: '#865EF6' }}
            thumbColor={switchValue ? '#FFFFFF' : '#9CA3AF'}
          />
        ) : showArrow ? (
          <ArrowLeft size={20} color="#6B7280" style={styles.arrowIcon} />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#6c5ce7','black','#6c5ce7']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Account Settings */}
            {renderSection({
              title: 'Account',
              children: (
                <>
                  {renderSettingItem({
                    icon: User,
                    title: 'Profile',
                    subtitle: 'Edit your profile information',
                    onPress: () => Alert.alert('Profile', 'Edit profile screen would open here')
                  })}
                  {renderSettingItem({
                    icon: Lock,
                    title: 'Change Password',
                    subtitle: 'Update your password',
                    onPress: () => Alert.alert('Change Password', 'Password change screen would open here')
                  })}
                  {renderSettingItem({
                    icon: Key,
                    title: 'Two-Factor Authentication',
                    subtitle: 'Add an extra layer of security',
                    onPress: () => Alert.alert('2FA', 'Two-factor authentication setup would open here')
                  })}
                </>
              )
            })}

            {/* Privacy Settings */}
            {renderSection({
              title: 'Privacy',
              children: (
                <>
                  {renderSettingItem({
                    icon: Eye,
                    title: 'Show Playtime',
                    subtitle: 'Allow others to see your playtime',
                    showSwitch: true,
                    switchValue: showPlaytime,
                    onSwitchChange: setShowPlaytime
                  })}
                  {renderSettingItem({
                    icon: Eye,
                    title: 'Show Reviews',
                    subtitle: 'Allow others to see your reviews',
                    showSwitch: true,
                    switchValue: showReviews,
                    onSwitchChange: setShowReviews
                  })}
                  {renderSettingItem({
                    icon: Eye,
                    title: 'Show Activity',
                    subtitle: 'Allow others to see your activity',
                    showSwitch: true,
                    switchValue: showActivity,
                    onSwitchChange: setShowActivity
                  })}
                </>
              )
            })}

            {/* Notifications */}
            {renderSection({
              title: 'Notifications',
              children: (
                <>
                  {renderSettingItem({
                    icon: Bell,
                    title: 'Push Notifications',
                    subtitle: 'Receive notifications on your device',
                    showSwitch: true,
                    switchValue: notificationsEnabled,
                    onSwitchChange: setNotificationsEnabled
                  })}
                  {renderSettingItem({
                    icon: Bell,
                    title: 'Notification Preferences',
                    subtitle: 'Customize what you want to be notified about',
                    onPress: () => Alert.alert('Notifications', 'Notification preferences screen would open here')
                  })}
                </>
              )
            })}

            {/* Appearance */}
            {renderSection({
              title: 'Appearance',
              children: (
                <>
                  {renderSettingItem({
                    icon: Palette,
                    title: 'Dark Mode',
                    subtitle: 'Use dark theme',
                    showSwitch: true,
                    switchValue: darkMode,
                    onSwitchChange: setDarkMode
                  })}
                  {renderSettingItem({
                    icon: Palette,
                    title: 'Theme Colors',
                    subtitle: 'Customize app colors',
                    onPress: () => Alert.alert('Theme', 'Theme customization screen would open here')
                  })}
                </>
              )
            })}

            {/* Integrations */}
            {renderSection({
              title: 'Integrations',
              children: (
                <>
                  {renderSettingItem({
                    icon: SteamLogo,
                    title: 'Steam',
                    subtitle: steamConnected ? 'Connected' : 'Connect your Steam account',
                    showSwitch: true,
                    switchValue: steamConnected,
                    onSwitchChange: setSteamConnected
                  })}
                  {renderSettingItem({
                    icon: GameController,
                    title: 'PlayStation',
                    subtitle: playstationConnected ? 'Connected' : 'Connect your PlayStation account',
                    showSwitch: true,
                    switchValue: playstationConnected,
                    onSwitchChange: setPlaystationConnected
                  })}
                  {renderSettingItem({
                    icon: GameController,
                    title: 'Xbox',
                    subtitle: xboxConnected ? 'Connected' : 'Connect your Xbox account',
                    showSwitch: true,
                    switchValue: xboxConnected,
                    onSwitchChange: setXboxConnected
                  })}
                </>
              )
            })}

            {/* Data Management */}
            {renderSection({
              title: 'Data Management',
              children: (
                <>
                  {renderSettingItem({
                    icon: Download,
                    title: 'Export Data',
                    subtitle: 'Download your data as JSON',
                    onPress: handleExportData
                  })}
                  {renderSettingItem({
                    icon: Upload,
                    title: 'Import Data',
                    subtitle: 'Import data from another source',
                    onPress: handleImportData
                  })}
                  {renderSettingItem({
                    icon: Database,
                    title: 'Auto Sync',
                    subtitle: 'Automatically sync your data',
                    showSwitch: true,
                    switchValue: autoSync,
                    onSwitchChange: setAutoSync
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
                    subtitle: 'Get help and find answers',
                    onPress: () => Alert.alert('Help', 'Help center would open here')
                  })}
                  {renderSettingItem({
                    icon: Info,
                    title: 'About',
                    subtitle: 'App version and information',
                    onPress: () => Alert.alert('About', 'App version: 1.0.0\nBuild: 2024.1.1')
                  })}
                </>
              )
            })}

            {/* Danger Zone */}
            {renderSection({
              title: 'Danger Zone',
              children: (
                <>
                  {renderSettingItem({
                    icon: SignOut,
                    title: 'Logout',
                    subtitle: 'Sign out of your account',
                    onPress: handleLogout,
                    destructive: true
                  })}
                  {renderSettingItem({
                    icon: Trash,
                    title: 'Delete Account',
                    subtitle: 'Permanently delete your account and data',
                    onPress: handleDeleteAccount,
                    destructive: true
                  })}
                </>
              )
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#865EF6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  settingItemDestructive: {
    borderBottomColor: '#7F1D1D',
  },
  settingItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconDestructive: {
    backgroundColor: '#7F1D1D',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingTitleDestructive: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  settingSubtitleDestructive: {
    color: '#F87171',
  },
  settingItemRight: {
    alignItems: 'center',
  },
  arrowIcon: {
    transform: [{ rotate: '180deg' }],
  },
});
