import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from 'react-native';
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
  X,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';

// Types for user data
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
}

interface UserStats {
  bio: string;
  joinDate: string;
  gamesPlayed: number;
  reviewsWritten: number;
  listsCreated: number;
  achievements: number;
  currentStreak: number;
  longestStreak: number;
  totalPlaytime: string;
  favoriteGenres: string[];
}

interface ActivityItem {
  id: string;
  type: string;
  game: string;
  action: string;
  rating?: number;
  date: string;
  gameImage: string;
}

// Default avatar for new users
const defaultAvatar = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face';

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
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  
  // Get real achievement data
  const {
    achievements: achievementsList,
    userStats: achievementStats,
    loading: achievementsLoading,
    getRecentAchievements,
    getUnlockedCount,
    getFavoriteGenres,
  } = useAchievements();
  
  // Real user stats - populated from achievement system
  const [userStats, setUserStats] = useState<UserStats>({
    bio: '',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    gamesPlayed: 0,
    reviewsWritten: 0,
    listsCreated: 0,
    achievements: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPlaytime: '0h',
    favoriteGenres: [],
  });
  
  // Real activity data - would come from user's actual activity
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
  // Real achievements data - loaded from achievement service
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Load achievement data on mount and when achievements change
  useEffect(() => {
    loadAchievementData();
  }, [achievementsList, achievementStats]);
  
  const loadAchievementData = async () => {
    if (achievementStats) {
      // Update user stats from achievement system
      setUserStats(prev => ({
        ...prev,
        gamesPlayed: achievementStats.gameCount,
        reviewsWritten: achievementStats.reviewCount,
        listsCreated: achievementStats.listCount,
        currentStreak: achievementStats.currentStreak,
        longestStreak: achievementStats.longestStreak,
      }));
    }
    
    // Load recent achievements
    const recent = await getRecentAchievements();
    setAchievements(recent);
    
    // Load total unlocked count
    const count = await getUnlockedCount();
    
    // Load favorite genres
    const genres = await getFavoriteGenres(3);
    
    setUserStats(prev => ({ 
      ...prev, 
      achievements: count,
      favoriteGenres: genres 
    }));
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarModal(false);
  };

  const handleUploadPhoto = () => {
    // This would integrate with image picker
    setShowAvatarModal(false);
  };



  const renderOverview = () => (
    <View className="mt-2">
      {/* Gaming Stats Grid */}
      <View className="mb-8">
        <Text className="font-bold text-xl text-white mb-4">
          Gaming Overview
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {/* Activity Streak */}
          <View className="w-[48%] mb-4">
            <LinearGradient
              colors={['#F43F5E', '#E11D48']}
              className="rounded-2xl p-4 items-center h-32"
            >
              <Fire size={28} color="#FFFFFF" weight="fill" />
              <Text className="font-bold text-2xl text-white mt-2">
                {userStats.currentStreak}
              </Text>
              <Text className="text-white/90 text-sm font-medium">Day Streak</Text>
            </LinearGradient>
          </View>
          
          {/* Total Playtime */}
          <View className="w-[48%] mb-4">
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              className="rounded-2xl p-4 items-center h-32"
            >
              <Clock size={28} color="#FFFFFF" weight="fill" />
              <Text className="font-bold text-xl text-white mt-2">
                {userStats.totalPlaytime}
              </Text>
              <Text className="text-white/90 text-sm font-medium">Total Time</Text>
            </LinearGradient>
          </View>
          
          {/* Achievements */}
          <View className="w-[48%] mb-4">
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              className="rounded-2xl p-4 items-center h-32"
            >
              <Trophy size={28} color="#FFFFFF" weight="fill" />
              <Text className="font-bold text-2xl text-white mt-2">
                {userStats.achievements}
              </Text>
              <Text className="text-white/90 text-sm font-medium">Achievements</Text>
            </LinearGradient>
          </View>
          
          {/* Join Date */}
          <View className="w-[48%] mb-4">
            <LinearGradient
              colors={['#10B981', '#059669']}
              className="rounded-2xl p-4 items-center h-32"
            >
              <Calendar size={28} color="#FFFFFF" weight="fill" />
              <Text className="font-bold text-lg text-white mt-2">
                {userStats.joinDate}
              </Text>
              <Text className="text-white/90 text-sm font-medium">Member Since</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Favorite Genres */}
      <View className="mb-8">
        <Text className="font-bold text-xl text-white mb-4">
          Favorite Genres
        </Text>
        {userStats.favoriteGenres.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {userStats.favoriteGenres.map((genre, index) => (
              <View key={index} className="bg-[#232946] px-4 py-3 rounded-full border border-[#374151]">
                <Text className="text-white font-medium">{genre}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-[#232946] rounded-xl p-6 border border-[#374151] items-center">
            <GameController size={32} color="#94A3B8" weight="bold" />
            <Text className="text-white font-bold text-lg mt-3 mb-2">No Favorite Genres Yet</Text>
            <Text className="text-[#94A3B8] text-center leading-5">
              Start reviewing games to discover your favorite genres!
            </Text>
          </View>
        )}
      </View>

      {/* Recent Achievements */}
      <View className="mb-6">
        <Text className="font-bold text-xl text-white mb-4">
          Recent Achievements
        </Text>
        {achievements.length > 0 ? (
          <View className="space-y-3">
            {achievements.slice(0, 3).map((achievement) => (
              <View key={achievement.id} className={`bg-[#232946] rounded-xl p-4 border ${
                achievement.unlocked ? 'border-[#00D2FF]/30' : 'border-[#374151]'
              } ${!achievement.unlocked ? 'opacity-60' : ''}`}>
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full justify-center items-center mr-4"
                    style={{ backgroundColor: achievement.unlocked ? achievement.color : '#374151' }}
                  >
                    <achievement.icon
                      size={24}
                      color={achievement.unlocked ? '#FFFFFF' : '#6B7280'}
                      weight="fill"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold text-base ${
                      achievement.unlocked ? 'text-white' : 'text-gray-400'
                    }`}>
                      {achievement.title}
                    </Text>
                    <Text className={`text-sm mt-1 ${
                      achievement.unlocked ? 'text-[#94A3B8]' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </Text>
                  </View>
                  {achievement.unlocked && (
                    <CheckCircle size={20} color="#22C55E" weight="fill" />
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-[#232946] rounded-xl p-6 border border-[#374151] items-center">
            <Trophy size={32} color="#94A3B8" weight="bold" />
            <Text className="text-white font-bold text-lg mt-3 mb-2">No Achievements Yet</Text>
            <Text className="text-[#94A3B8] text-center leading-5">
              Complete activities to unlock achievements and track your progress!
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderActivity = () => (
    <View className="mt-2">
      <Text className="font-bold text-xl text-white mb-4">
        Recent Activity
      </Text>
      {recentActivity.length > 0 ? (
        <View className="space-y-3">
          {recentActivity.map((item) => (
            <View key={item.id} className="bg-[#232946] rounded-2xl p-4 border border-[#374151]">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: item.gameImage }}
                  className="w-14 h-14 rounded-xl"
                />
                <View className="flex-1 ml-4">
                  <Text className="font-bold text-base text-white mb-1">{item.game}</Text>
                  <Text className="text-[#94A3B8] text-sm mb-2">{item.action}</Text>
                  {item.rating && (
                    <View className="flex-row items-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          color={star <= (item.rating || 0) ? '#F59E0B' : '#374151'}
                          weight={star <= (item.rating || 0) ? 'fill' : 'regular'}
                        />
                      ))}
                    </View>
                  )}
                  <Text className="text-xs text-[#6B7280]">{item.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-20">
          <View className="w-20 h-20 rounded-full bg-[#232946] justify-center items-center mb-4">
            <GameController size={32} color="#94A3B8" weight="bold" />
          </View>
          <Text className="text-white text-xl font-bold mb-2">No Activity Yet</Text>
          <Text className="text-[#94A3B8] text-center px-8">
            Start playing and reviewing games to see your activity here!
          </Text>
        </View>
      )}
    </View>
  );

  const renderStats = () => (
    <View className="mt-2">
      <Text className="font-bold text-xl text-white mb-4">
        Detailed Statistics
      </Text>
      
      {/* Main Stats Card */}
      <View className="bg-[#232946] rounded-2xl p-5 mb-6 border border-[#374151]">
        <View className="space-y-4">
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <Calendar size={20} color="#00D2FF" weight="fill" />
              <Text className="text-[#94A3B8] ml-3 font-medium">Member Since</Text>
            </View>
            <Text className="font-bold text-white text-lg">{userStats.joinDate}</Text>
          </View>
          
          <View className="h-px bg-[#374151]" />
          
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <GameController size={20} color="#00D2FF" weight="fill" />
              <Text className="text-[#94A3B8] ml-3 font-medium">Games Played</Text>
            </View>
            <Text className="font-bold text-white text-lg">{userStats.gamesPlayed}</Text>
          </View>
          
          <View className="h-px bg-[#374151]" />
          
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <Clock size={20} color="#00D2FF" weight="fill" />
              <Text className="text-[#94A3B8] ml-3 font-medium">Total Playtime</Text>
            </View>
            <Text className="font-bold text-white text-lg">{userStats.totalPlaytime}</Text>
          </View>
          
          <View className="h-px bg-[#374151]" />
          
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <Star size={20} color="#00D2FF" weight="fill" />
              <Text className="text-[#94A3B8] ml-3 font-medium">Reviews Written</Text>
            </View>
            <Text className="font-bold text-white text-lg">{userStats.reviewsWritten}</Text>
          </View>
        </View>
      </View>
      
      {/* Streak Stats */}
      <View className="bg-[#232946] rounded-2xl p-5 border border-[#374151]">
        <Text className="font-bold text-lg text-white mb-4">Activity Streaks</Text>
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Fire size={18} color="#F43F5E" weight="fill" />
              <Text className="text-[#94A3B8] ml-3 font-medium">Current Streak</Text>
            </View>
            <Text className="font-bold text-white">{userStats.currentStreak} days</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Crown size={18} color="#F59E0B" weight="fill" />
              <Text className="text-[#94A3B8] ml-3 font-medium">Longest Streak</Text>
            </View>
            <Text className="font-bold text-white">{userStats.longestStreak} days</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0F0F1F', '#121631', '#0A2342']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Text className="font-bold text-xl text-white">Profile</Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full justify-center items-center"
            onPress={() => router.push('/settings' as any)}
          >
            <Gear size={24} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pb-8">
            {/* Profile Header */}
            <View className="items-center mb-8">
              <TouchableOpacity
                className="relative mb-6"
                onPress={() => setShowAvatarModal(true)}
              >
                <LinearGradient
                  colors={['#00D2FF', '#6c5ce7']}
                  className="w-28 h-28 rounded-full p-1"
                >
                  <Image
                    source={{ uri: selectedAvatar }}
                    className="w-full h-full rounded-full"
                  />
                </LinearGradient>
                <View className="absolute bottom-0 right-0 w-10 h-10 bg-[#00D2FF] rounded-full justify-center items-center border-3 border-[#0F0F1F] shadow-lg">
                  <Camera size={18} color="#FFFFFF" weight="fill" />
                </View>
              </TouchableOpacity>

              <Text className="font-bold text-3xl text-white mb-3">
                {user?.username || 'New Gamer'}
              </Text>
              {userStats.bio ? (
                <Text className="text-[#94A3B8] text-lg text-center mb-4 leading-6">
                  {userStats.bio}
                </Text>
              ) : (
                <Text className="text-[#94A3B8] text-lg text-center mb-4 leading-6 italic">
                  Add a bio to tell others about your gaming interests
                </Text>
              )}
              
              {/* Quick Stats */}
              <View className="flex-row space-x-6 mt-2">
                <View className="items-center">
                  <Text className="font-bold text-2xl text-white">{userStats.gamesPlayed}</Text>
                  <Text className="text-[#94A3B8] text-sm mt-1">Games</Text>
                </View>
                <View className="items-center">
                  <Text className="font-bold text-2xl text-white">{userStats.reviewsWritten}</Text>
                  <Text className="text-[#94A3B8] text-sm mt-1">Reviews</Text>
                </View>
                <View className="items-center">
                  <Text className="font-bold text-2xl text-white">{userStats.listsCreated}</Text>
                  <Text className="text-[#94A3B8] text-sm mt-1">Lists</Text>
                </View>
              </View>
            </View>

            {/* Navigation Tabs */}
            <View className="flex-row mb-6">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl mr-2 ${
                  activeTab === 'overview' ? 'bg-[#00D2FF]' : 'bg-[#1A2238]'
                }`}
                onPress={() => setActiveTab('overview')}
              >
                <Text
                  className={`font-semibold text-center ${
                    activeTab === 'overview' ? 'text-white' : 'text-white'
                  }`}
                >
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl mx-1 ${
                  activeTab === 'activity' ? 'bg-[#00D2FF]' : 'bg-[#1A2238]'
                }`}
                onPress={() => setActiveTab('activity')}
              >
                <Text
                  className={`font-semibold text-center ${
                    activeTab === 'activity' ? 'text-white' : 'text-white'
                  }`}
                >
                  Activity
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ml-2 ${
                  activeTab === 'stats' ? 'bg-[#00D2FF]' : 'bg-[#1A2238]'
                }`}
                onPress={() => setActiveTab('stats')}
              >
                <Text
                  className={`font-semibold text-center ${
                    activeTab === 'stats' ? 'text-white' : 'text-white'
                  }`}
                >
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
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-[#1A2238] rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="font-bold text-xl text-white">
                  Choose Avatar
                </Text>
                <TouchableOpacity
                  className="w-10 h-10 rounded-full justify-center items-center"
                  onPress={() => setShowAvatarModal(false)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap justify-between">
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`w-20 h-20 rounded-full border-3 mb-4 ${
                      selectedAvatar === avatar
                        ? 'border-[#00D2FF]'
                        : 'border-[#374151]'
                    }`}
                    onPress={() => handleAvatarSelect(avatar)}
                  >
                    <Image
                      source={{ uri: avatar }}
                      className="w-full h-full rounded-full"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className="mt-6 bg-[#865EF6] py-3 px-4 rounded-xl flex-row items-center justify-center"
                onPress={handleUploadPhoto}
              >
                <Camera size={20} color="#FFFFFF" weight="fill" />
                <Text className="text-white font-medium ml-2">
                  Upload Your Photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
