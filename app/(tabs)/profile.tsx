import React, { useState } from 'react';
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

const mockUser = {
  username: 'GamerPro',
  avatar:
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
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
    gameImage:
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200',
  },
  {
    id: '2',
    type: 'play',
    game: 'Cyberpunk 2077',
    action: 'Started playing',
    date: '1 day ago',
    gameImage:
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200',
  },
  {
    id: '3',
    type: 'list',
    game: 'Created list',
    action: 'My Top 10 RPGs',
    date: '3 days ago',
    gameImage:
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200',
  },
  {
    id: '4',
    type: 'achievement',
    game: 'God of War',
    action: 'Unlocked achievement',
    achievement: 'Legendary Warrior',
    date: '1 week ago',
    gameImage:
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200',
  },
];

const mockFavoriteGames = [
  {
    id: '1',
    title: 'The Witcher 3',
    genre: 'RPG',
    rating: 5,
    playtime: '120h',
    image:
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200',
  },
  {
    id: '2',
    title: 'Red Dead Redemption 2',
    genre: 'Action',
    rating: 5,
    playtime: '85h',
    image:
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200',
  },
  {
    id: '3',
    title: 'Hollow Knight',
    genre: 'Indie',
    rating: 4,
    playtime: '45h',
    image:
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=150&h=200',
  },
];

const mockAchievements = [
  {
    id: '1',
    title: 'Review Master',
    description: 'Wrote 20 reviews',
    icon: Star,
    color: '#F59E0B',
    unlocked: true,
  },
  {
    id: '2',
    title: 'List Creator',
    description: 'Created 5 lists',
    icon: Trophy,
    color: '#22C55E',
    unlocked: true,
  },
  {
    id: '3',
    title: 'Streak Master',
    description: '7 day activity streak',
    icon: Fire,
    color: '#F43F5E',
    unlocked: true,
  },
  {
    id: '4',
    title: 'Completionist',
    description: '100% completion in 10 games',
    icon: Crown,
    color: '#8B5CF6',
    unlocked: false,
  },
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
    <View className="flex-row p-3 mb-3 bg-[#1A2238] rounded-xl border border-[#374151]">
      <Image
        source={{ uri: item.gameImage }}
        className="w-16 h-16 rounded-lg"
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="font-bold text-base text-white">{item.game}</Text>
        <Text className="text-sm text-gray-400">{item.action}</Text>
        {item.rating && (
          <View className="flex-row mt-1">
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
        <Text className="text-xs text-gray-500 mt-1">{item.date}</Text>
      </View>
    </View>
  );

  const renderFavoriteGame = ({ item }: { item: any }) => (
    <View className="w-48 mr-3 bg-[#1A2238] rounded-xl overflow-hidden">
      <Image
        source={{ uri: item.image }}
        className="w-full h-28 rounded-t-xl"
      />
      <View className="p-3">
        <Text className="font-bold text-sm text-white mb-1">{item.title}</Text>
        <Text className="text-xs text-[#00D2FF] mb-2">{item.genre}</Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                color={star <= item.rating ? '#F59E0B' : '#374151'}
                weight={star <= item.rating ? 'fill' : 'regular'}
              />
            ))}
          </View>
          <Text className="text-xs text-gray-400">{item.playtime}</Text>
        </View>
      </View>
    </View>
  );

  const renderAchievement = ({ item }: { item: any }) => (
    <View
      className={`w-56 mr-3 p-3 bg-[#1A2238] rounded-xl border flex-row items-center ${
        !item.unlocked ? 'opacity-50 border-[#374151]' : 'border-[#865EF6]'
      }`}
    >
      <View
        className={`w-10 h-10 rounded-full justify-center items-center mr-3`}
        style={{ backgroundColor: item.unlocked ? item.color : '#374151' }}
      >
        <item.icon
          size={20}
          color={item.unlocked ? '#FFFFFF' : '#6B7280'}
          weight="fill"
        />
      </View>
      <View className="flex-1">
        <Text
          className={`font-bold text-sm ${
            !item.unlocked ? 'text-gray-400' : 'text-white'
          }`}
        >
          {item.title}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            !item.unlocked ? 'text-gray-500' : 'text-gray-400'
          }`}
        >
          {item.description}
        </Text>
      </View>
      {item.unlocked && <CheckCircle size={16} color="#22C55E" weight="fill" />}
    </View>
  );

  const renderOverview = () => (
    <View className="mt-2">
      {/* Current Streak */}
      <View className="mb-6">
        <Text className="font-bold text-lg text-white mb-3">
          Activity Streak
        </Text>
        <View className="rounded-xl overflow-hidden">
          <LinearGradient
            colors={['#F43F5E', '#E11D48']}
            className="p-4 items-center"
          >
            <Fire size={32} color="#FFFFFF" weight="fill" />
            <Text className="font-bold text-3xl text-white mt-2">
              {mockUser.currentStreak} days
            </Text>
            <Text className="text-white/80 text-sm mt-1">Current Streak</Text>
            <Text className="text-white/60 text-xs mt-2">
              Best: {mockUser.longestStreak} days
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Favorite Games */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-bold text-lg text-white">Favorite Games</Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-[#865EF6] font-medium text-sm mr-1">
              See All
            </Text>
            <ArrowRight size={16} color="#865EF6" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockFavoriteGames}
          renderItem={renderFavoriteGame}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </View>

      {/* Recent Achievements */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-bold text-lg text-white">
            Recent Achievements
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-[#865EF6] font-medium text-sm mr-1">
              See All
            </Text>
            <ArrowRight size={16} color="#865EF6" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockAchievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </View>
    </View>
  );

  const renderActivity = () => (
    <View className="mt-2">
      <FlatList
        data={mockRecentActivity}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );

  const renderStats = () => (
    <View className="mt-2">
      <Text className="font-bold text-lg text-white mb-3">
        Detailed Statistics
      </Text>
      <View className="bg-[#1A2238] rounded-xl p-4 divide-y divide-gray-700">
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-gray-400">Member Since</Text>
          <Text className="font-medium text-white">{mockUser.joinDate}</Text>
        </View>
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-gray-400">Lists Created</Text>
          <Text className="font-medium text-white">
            {mockUser.listsCreated}
          </Text>
        </View>
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-gray-400">Favorite Genres</Text>
          <Text className="font-medium text-white">
            {mockUser.favoriteGenres.join(', ')}
          </Text>
        </View>
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-gray-400">Total Playtime</Text>
          <Text className="font-medium text-white">
            {mockUser.totalPlaytime}
          </Text>
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
            <View className="items-center mb-6">
              <TouchableOpacity
                className="relative mb-4"
                onPress={() => setShowAvatarModal(true)}
              >
                <Image
                  source={{ uri: selectedAvatar }}
                  className="w-24 h-24 rounded-full border-4 border-white"
                />
                <View className="absolute bottom-0 right-0 w-8 h-8 bg-[#00D2FF] rounded-full justify-center items-center border-2 border-white">
                  <Camera size={16} color="#FFFFFF" weight="fill" />
                </View>
              </TouchableOpacity>

              <Text className="font-bold text-2xl text-white mb-2">
                {user?.username || mockUser.username}
              </Text>
              <Text className="text-gray-400 text-base text-center">
                {mockUser.bio}
              </Text>
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
                    activeTab === 'overview' ? 'text-black' : 'text-white'
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
                    activeTab === 'activity' ? 'text-black' : 'text-white'
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
                    activeTab === 'stats' ? 'text-black' : 'text-white'
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

              <View className="flex-row flex-wrap gap-4">
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`w-16 h-16 rounded-full border-2 ${
                      selectedAvatar === avatar
                        ? 'border-[#00D2FF]'
                        : 'border-gray-600'
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
