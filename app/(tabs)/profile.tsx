import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Gear, 
  Trophy, 
  Clock, 
  Star, 
  GameController, 
  Heart, 
  Medal, 
  Calendar,
  ArrowRight,
  Play,
  Pause,
  CheckCircle,
  Crown,
  Target,
  Fire,
  Camera,
  X
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const mockUser = {
  username: 'GamerPro',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
  bio: 'RPG enthusiast and indie game explorer 🎮',
  joinDate: 'March 2023',
  totalPlaytime: '1,247 hours',
  gamesPlayed: 156,
  reviewsWritten: 23,
  listsCreated: 8,
  achievements: 45,
  favoriteGenres: ['RPG', 'Action', 'Indie'],
  currentStreak: 7,
  longestStreak: 23,
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'review',
    game: 'Elden Ring',
    action: 'Wrote a review',
    rating: 5,
    date: '2 hours ago',
    gameImage: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200'
  },
  {
    id: '2',
    type: 'play',
    game: 'Cyberpunk 2077',
    action: 'Started playing',
    date: '1 day ago',
    gameImage: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200'
  },
  {
    id: '3',
    type: 'list',
    game: 'Created list',
    action: 'My Top 10 RPGs',
    date: '3 days ago',
    gameImage: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200'
  },
  {
    id: '4',
    type: 'achievement',
    game: 'God of War',
    action: 'Unlocked achievement',
    achievement: 'Legendary Warrior',
    date: '1 week ago',
    gameImage: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200'
  }
];

const mockFavoriteGames = [
  {
    id: '1',
    title: 'The Witcher 3',
    genre: 'RPG',
    rating: 5,
    playtime: '120h',
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200'
  },
  {
    id: '2',
    title: 'Red Dead Redemption 2',
    genre: 'Action',
    rating: 5,
    playtime: '85h',
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200'
  },
  {
    id: '3',
    title: 'Hollow Knight',
    genre: 'Indie',
    rating: 4,
    playtime: '45h',
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200'
  }
];

const mockAchievements = [
  { id: '1', title: 'Review Master', description: 'Wrote 20 reviews', icon: Star, color: '#F59E0B', unlocked: true },
  { id: '2', title: 'List Creator', description: 'Created 5 lists', icon: Trophy, color: '#22C55E', unlocked: true },
  { id: '3', title: 'Streak Master', description: '7 day activity streak', icon: Fire, color: '#F43F5E', unlocked: true },
  { id: '4', title: 'Completionist', description: '100% completion in 10 games', icon: Crown, color: '#8B5CF6', unlocked: false },
];

const avatarOptions = [
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
  'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
  'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(mockUser.avatar);

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarModal(false);
  };

  const handleUploadPhoto = () => {
    // This would integrate with image picker
    setShowAvatarModal(false);
  };

  const renderActivityItem = ({ item }: { item: any }) => (
    <View style={styles.activityItem}>
      <Image source={{ uri: item.gameImage }} style={styles.activityGameImage} />
      <View style={styles.activityContent}>
        <Text style={styles.activityGame}>{item.game}</Text>
        <Text style={styles.activityAction}>{item.action}</Text>
        {item.rating && (
          <View style={styles.activityRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                color={star <= item.rating ? '#F59E0B' : '#374151'} 
                weight={star <= item.rating ? 'fill' : 'regular'} 
              />
            ))}
          </View>
        )}
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
    </View>
  );

  const renderFavoriteGame = ({ item }: { item: any }) => (
    <View style={styles.favoriteGameItem}>
      <Image source={{ uri: item.image }} style={styles.favoriteGameImage} />
      <View style={styles.favoriteGameContent}>
        <Text style={styles.favoriteGameTitle}>{item.title}</Text>
        <Text style={styles.favoriteGameGenre}>{item.genre}</Text>
        <View style={styles.favoriteGameMeta}>
          <View style={styles.favoriteGameRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={10} 
                color={star <= item.rating ? '#F59E0B' : '#374151'} 
                weight={star <= item.rating ? 'fill' : 'regular'} 
              />
            ))}
          </View>
          <Text style={styles.favoriteGamePlaytime}>{item.playtime}</Text>
        </View>
      </View>
    </View>
  );

  const renderAchievement = ({ item }: { item: any }) => (
    <View style={[styles.achievementItem, !item.unlocked && styles.achievementLocked]}>
      <View style={[styles.achievementIcon, { backgroundColor: item.unlocked ? item.color : '#374151' }]}>
        <item.icon size={20} color={item.unlocked ? '#FFFFFF' : '#6B7280'} weight="fill" />
      </View>
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, !item.unlocked && styles.achievementTitleLocked]}>
          {item.title}
        </Text>
        <Text style={[styles.achievementDescription, !item.unlocked && styles.achievementDescriptionLocked]}>
          {item.description}
        </Text>
      </View>
      {item.unlocked && <CheckCircle size={16} color="#22C55E" weight="fill" />}
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Current Streak */}
      <View style={styles.streakSection}>
        <Text style={styles.sectionTitle}>Activity Streak</Text>
        <View style={styles.streakCard}>
          <LinearGradient
            colors={['#F43F5E', '#E11D48']}
            style={styles.streakGradient}
          >
            <Fire size={32} color="#FFFFFF" weight="fill" />
            <Text style={styles.streakDays}>{mockUser.currentStreak} days</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakBest}>Best: {mockUser.longestStreak} days</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Favorite Games */}
      <View style={styles.favoritesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favorite Games</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <ArrowRight size={16} color="#865EF6" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockFavoriteGames}
          renderItem={renderFavoriteGame}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.favoritesList}
        />
      </View>

      {/* Recent Achievements */}
      <View style={styles.achievementsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <ArrowRight size={16} color="#865EF6" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockAchievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsList}
        />
      </View>
    </View>
  );

  const renderActivity = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={mockRecentActivity}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.activityList}
      />
    </View>
  );

  const renderStats = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Detailed Statistics</Text>
      <View style={styles.detailedStats}>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Member Since</Text>
          <Text style={styles.detailedStatValue}>{mockUser.joinDate}</Text>
        </View>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Lists Created</Text>
          <Text style={styles.detailedStatValue}>{mockUser.listsCreated}</Text>
        </View>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Favorite Genres</Text>
          <Text style={styles.detailedStatValue}>{mockUser.favoriteGenres.join(', ')}</Text>
        </View>
        <View style={styles.detailedStatItem}>
          <Text style={styles.detailedStatLabel}>Total Playtime</Text>
          <Text style={styles.detailedStatValue}>{mockUser.totalPlaytime}</Text>
        </View>
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
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={() => router.push('/settings' as any)}
          >
            <Gear size={24} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => setShowAvatarModal(true)}
              >
                <Image source={{ uri: selectedAvatar }} style={styles.avatar} />
                <View style={styles.avatarEditOverlay}>
                  <Camera size={16} color="#FFFFFF" weight="fill" />
                </View>
              </TouchableOpacity>
              
              <Text style={styles.username}>{user?.username || mockUser.username}</Text>
              <Text style={styles.bio}>{mockUser.bio}</Text>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
                onPress={() => setActiveTab('overview')}
              >
                <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'activity' && styles.activeTab]} 
                onPress={() => setActiveTab('activity')}
              >
                <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
                  Activity
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'stats' && styles.activeTab]} 
                onPress={() => setActiveTab('stats')}
              >
                <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
                  Stats
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'activity' && renderActivity()}
            {activeTab === 'stats' && renderStats()}
          </View>
        </ScrollView>

        {/* Avatar Selection Modal */}
        <Modal
          visible={showAvatarModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Avatar</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowAvatarModal(false)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.avatarGrid}>
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.avatarOption,
                      selectedAvatar === avatar && styles.selectedAvatar
                    ]}
                    onPress={() => handleAvatarSelect(avatar)}
                  >
                    <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
                  </TouchableOpacity>
                ))}
            </View>

              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleUploadPhoto}
              >
                <Camera size={20} color="#FFFFFF" weight="fill" />
                <Text style={styles.uploadButtonText}>Upload Your Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    borderBottomColor: '#865EF6',
  },
  headerTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
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
    borderColor: '#865EF6',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#865EF6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  username: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bio: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#865EF6',
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#A1A1AA',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    minHeight: 400,
  },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#865EF6',
    marginRight: 4,
  },
  streakSection: {
    marginBottom: 24,
  },
  streakCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: 20,
    alignItems: 'center',
  },
  streakDays: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  streakLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakBest: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#FBBF24',
  },
  favoritesSection: {
    marginBottom: 24,
  },
  favoritesList: {
    paddingRight: 16,
  },
  favoriteGameItem: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  favoriteGameImage: {
    width: '100%',
    height: 80,
  },
  favoriteGameContent: {
    padding: 8,
  },
  favoriteGameTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  favoriteGameGenre: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  favoriteGameMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteGameRating: {
    flexDirection: 'row',
  },
  favoriteGamePlaytime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#A1A1AA',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsList: {
    paddingRight: 16,
  },
  achievementItem: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: '#6B7280',
  },
  achievementDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
  },
  achievementDescriptionLocked: {
    color: '#6B7280',
  },
  activityList: {
    paddingBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activityGameImage: {
    width: 50,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityGame: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityAction: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  activityRating: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  activityDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  detailedStats: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  detailedStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  detailedStatLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#A1A1AA',
  },
  detailedStatValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedAvatar: {
    borderColor: '#865EF6',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#865EF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});