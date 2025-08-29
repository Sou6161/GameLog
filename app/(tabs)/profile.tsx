import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gear, Trophy, Clock, Star, SteamLogo } from 'phosphor-react-native';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/hooks/useAuth';

const mockUser = {
  username: 'GamerPro',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
  bio: 'RPG enthusiast and indie game explorer 🎮',
  steamConnected: true,
  level: 42,
};

const mockStats = [
  { label: 'Games Played', value: '156', icon: Trophy, color: '#22D3EE' },
  { label: 'Hours Logged', value: '1,247', icon: Clock, color: '#22C55E' },
  { label: 'Reviews', value: '23', icon: Star, color: '#F59E0B' },
  { label: 'Lists', value: '8', icon: Star, color: '#F43F5E' },
];

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  return (
    <LinearGradient
      colors={['#0A0F1F', '#111827']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(!showSettings)}>
            <Gear size={24} color="#22D3EE" weight="bold" />
          </TouchableOpacity>
          {showSettings && (
            <View style={styles.settingsMenu}>
              <TouchableOpacity style={styles.settingsItem} onPress={logout}>
                <Text style={styles.settingsItemText}>Log out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{mockUser.level}</Text>
                </View>
              </View>
              
              <Text style={styles.username}>{user?.username || mockUser.username}</Text>
              <Text style={styles.bio}>{mockUser.bio}</Text>
              
              {/* Steam Badge */}
              {mockUser.steamConnected && (
                <View style={styles.steamBadge}>
                  <SteamLogo size={16} color="#22D3EE" weight="bold" />
                  <Text style={styles.steamText}>Steam Connected</Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Gaming Stats</Text>
              <View style={styles.statsGrid}>
                {mockStats.map((stat, index) => (
                  <StatCard key={index} stat={stat} />
                ))}
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityPlaceholder}>
                <Text style={styles.placeholderText}>Your recent gaming activity will appear here</Text>
              </View>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#22D3EE',
  },
  headerTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#22D3EE',
    textShadowColor: '#22D3EE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  settingsButton: {
    padding: 8,
  },
  settingsMenu: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#1A2238',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 8,
    minWidth: 140,
    zIndex: 10,
  },
  settingsItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  settingsItemText: {
    color: '#E2E8F0',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#22D3EE',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#F43F5E',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A0F1F',
  },
  levelText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 12,
    color: '#E2E8F0',
  },
  username: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  bio: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  steamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2238',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  steamText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#22D3EE',
    marginLeft: 4,
  },
  statsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: '#E2E8F0',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  section: {
    marginBottom: 32,
  },
  activityPlaceholder: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  placeholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
});