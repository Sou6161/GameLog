import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, gradients, glow, alpha } from '@/constants/theme';
import {
  Gear,
  Trophy,
  Clock,
  Star,
  GameController,
  Calendar,
  CheckCircle,
  Crown,
  Fire,
  Camera,
  X,
} from 'phosphor-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import { useReviewStore } from '@/store/reviewStore';
import { useListStore } from '@/store/listStore';
import { useAchievements } from '@/hooks/useAchievements';
import SteamConnectionCard from '@/components/SteamConnectionCard';
import { XpService, XpState } from '@/services/xpService';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';

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
  const { user, isLoading, isAuthenticated, updateAvatar, saveAvatarUrl } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
  
  // Safe user data extraction
  const userName = user?.username || 'Guest User';
  
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
  
  // Server-owned XP / level / rank.
  const [xpState, setXpState] = useState<XpState | null>(null);

  // --- Real, server-backed stats (no local counters, no placeholders) ---
  const libraryGames = useGameStore((s) => s.libraryGames);
  const myReviews = useReviewStore((s) => s.reviews);
  const fetchUserReviews = useReviewStore((s) => s.fetchUserReviews);

  const gamesCount = libraryGames.length;
  const reviewsCount = myReviews.length;
  const listsCount = useListStore((s) => s.lists.length);
  const fetchLists = useListStore((s) => s.fetchLists);

  // Total playtime is real Steam hours, not a hardcoded "0h".
  const totalPlaytime = React.useMemo(() => {
    const minutes = libraryGames.reduce((sum, g) => sum + (g.steamPlaytimeMinutes || 0), 0);
    if (minutes <= 0) return '0h';
    return `${Math.round(minutes / 60).toLocaleString()}h`;
  }, [libraryGames]);

  // Real join date from the account, not "today".
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  // Real activity data - would come from user's actual activity
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
  // Real achievements data - loaded from achievement service
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Bio editing state
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  // Load achievement data on mount and when achievements change
  useEffect(() => {
    loadAchievementData();
  }, [achievementsList, achievementStats]);

  // Refresh XP whenever the profile comes into focus, so a Steam sync or a new
  // review is reflected as soon as the user lands back here.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      XpService.getXp().then((s) => {
        if (!cancelled && s) setXpState(s);
      });
      // Pull the real review count for this user (another screen may have left
      // the shared review store holding a *game's* reviews instead of mine).
      if (user?.id) {
        fetchUserReviews(user.id);
        fetchLists();
      }
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );
  
  // Load bio independently to avoid conflicts
  useEffect(() => {
    loadBioFromStorage();
  }, []);
  
  // Load bio from AsyncStorage
  const loadBioFromStorage = async () => {
    try {
      const savedBio = await AsyncStorage.getItem('user_bio');
      
      if (savedBio && savedBio.trim().length > 0) {
        setUserStats(prev => ({ ...prev, bio: savedBio }));
        setBioText(savedBio);
      }
    } catch (error) {
      console.error('Error loading bio from storage:', error);
    }
  };
  
  // Save bio to AsyncStorage
  const saveBioToStorage = async (bio: string) => {
    try {
      await AsyncStorage.setItem('user_bio', bio);
      setUserStats(prev => ({ ...prev, bio }));
      console.log('Bio saved successfully');
    } catch (error) {
      console.error('Error saving bio to storage:', error);
      Alert.alert('Error', 'Failed to save bio. Please try again.');
    }
  };
  
  const loadAchievementData = async () => {
    if (achievementStats) {
      // Games/reviews/playtime/join-date are derived from REAL server data below.
      // achievementStats are device-local AsyncStorage counters that drift from
      // reality (they even survived onto a fresh account), so they're no longer
      // trusted for anything the server actually knows.
      setUserStats(prev => ({
        ...prev,
        listsCreated: achievementStats.listCount,
        currentStreak: achievementStats.currentStreak,
        longestStreak: achievementStats.longestStreak,
      }));
    }
    
    // Load recent achievements
    const recent = await getRecentAchievements();
    setAchievements(Array.isArray(recent) ? recent : []);
    
    // Load total unlocked count
    const count = await getUnlockedCount();
    
    // Load favorite genres
    const genres = await getFavoriteGenres(3);
    
    setUserStats(prev => ({ 
      ...prev, 
      bio: prev.bio, // Preserve bio
      achievements: count,
      favoriteGenres: genres 
    }));
  };

  // Show the signed-in user's saved avatar.
  useEffect(() => {
    if (user?.avatar) setSelectedAvatar(user.avatar);
  }, [user?.avatar]);

  // Pick a preset avatar and persist it.
  const handleAvatarSelect = async (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarModal(false);
    try {
      await saveAvatarUrl(avatar);
    } catch (error) {
      console.error('Failed to save avatar:', error);
      showConfirmation('Error', 'Could not save your avatar. Please try again.', () => {}, 'warning', 'OK', '');
    }
  };

  // Pick a photo from the gallery, upload it, and persist the URL.
  const handleUploadPhoto = async () => {
    try {
      // Load the native picker lazily so a missing module never blocks app start.
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setShowAvatarModal(false);
        showConfirmation('Permission needed', 'Please allow photo access to upload a picture.', () => {}, 'warning', 'OK', '');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        showConfirmation('Error', 'Could not read the selected image.', () => {}, 'warning', 'OK', '');
        return;
      }
      setShowAvatarModal(false);
      setUploadingAvatar(true);
      const dataUri = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
      const url = await updateAvatar(dataUri);
      setSelectedAvatar(url);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      showConfirmation('Upload failed', 'Could not upload your photo. Please try again.', () => {}, 'warning', 'OK', '');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Bio editing functions
  const handleEditBio = () => {
    setBioText(userStats.bio);
    setIsEditingBio(true);
    setShowBioModal(true);
  };

  const handleSaveBio = async () => {
    const trimmedBio = bioText.trim();
    
    try {
      await AsyncStorage.setItem('user_bio', trimmedBio);
      
      // Update state immediately
      setUserStats(prev => ({ ...prev, bio: trimmedBio }));
      
      setIsEditingBio(false);
      setShowBioModal(false);
      
    } catch (error) {
      console.error('Error saving bio:', error);
      Alert.alert('Error', 'Failed to save bio. Please try again.');
    }
  };

  const handleCancelBio = () => {
    setBioText(userStats.bio);
    setIsEditingBio(false);
    setShowBioModal(false);
  };



  // Gamer Level comes from the server, where XP is EARNED and stored per event.
  // It was previously recomputed from current stats, which meant deleting a
  // review or removing a game could make you LOSE XP and drop a level.
  const xp = xpState?.xp ?? 0;
  const level = xpState?.level ?? 1;
  const rank = xpState?.rank ?? 'Rookie';
  const XP_PER_LEVEL = xpState?.xpPerLevel ?? 500;
  const xpInLevel = xpState?.xpInLevel ?? 0;
  const levelProgress = Math.max(0.03, xpInLevel / XP_PER_LEVEL);

  const renderOverview = () => (
    <View className="mt-2">
      {/* Connections (Steam import) */}
      <SteamConnectionCard />

      {/* Gamer Level */}
      <View className="mb-8 rounded-2xl p-5" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        <View className="flex-row items-center mb-4">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: colors.teal, ...glow(colors.teal, 0.4, 12) }}
          >
            <Text className="text-[10px] font-bold" style={{ color: alpha(colors.void, 0.7) }}>LVL</Text>
            <Text className="text-2xl font-bold -mt-1" style={{ color: colors.void }}>{level}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>Gamer Level</Text>
            <View className="self-start px-2.5 py-1 rounded-full mt-1" style={{ backgroundColor: alpha(colors.teal, 0.16) }}>
              <Text className="text-xs font-bold" style={{ color: colors.tealBright }}>{rank}</Text>
            </View>
          </View>
          {/* flexShrink:0 keeps the flex-1 column beside this from squeezing it —
              Android then clips the label ("total XP" -> "total"). */}
          {/* An explicit minWidth guarantees room for the label. Relying on the
              shrink-wrapped width alone let Android clip "Total XP" -> "Total". */}
          <View className="items-end ml-2" style={{ flexShrink: 0, minWidth: 72 }}>
            <Text
              className="font-bold text-base"
              style={{ color: colors.gold, alignSelf: 'stretch', textAlign: 'right' }}
            >
              {xp.toLocaleString()}
            </Text>
            <Text
              className="text-xs"
              style={{ color: colors.textMuted, alignSelf: 'stretch', textAlign: 'right' }}
            >
              Total XP
            </Text>
          </View>
        </View>
        {/* XP progress to next level */}
        <View className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.elevated }}>
          <View style={{ height: '100%', width: `${levelProgress * 100}%`, backgroundColor: colors.teal, borderRadius: 999 }} />
        </View>
        <Text className="text-xs mt-1.5" style={{ color: colors.textMuted }}>
          {xpInLevel} / {XP_PER_LEVEL} XP to Level {level + 1}
        </Text>
      </View>

      {/* Gaming Stats Grid */}
      <View className="mb-8">
        <Text className="font-bold text-xl text-white mb-4">
          Gaming Overview
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {/* Activity Streak */}
          <View className="w-[48%] mb-4 rounded-2xl p-4 items-center h-32" style={{ backgroundColor: colors.red }}>
            <Fire size={28} color={colors.void} weight="fill" />
            <Text className="font-bold text-2xl mt-2" style={{ color: colors.void }}>{userStats.currentStreak}</Text>
            <Text className="text-sm font-semibold" style={{ color: alpha(colors.void, 0.75), alignSelf: 'stretch', textAlign: 'center' }}>Day Streak</Text>
          </View>

          {/* Total Playtime */}
          <View className="w-[48%] mb-4 rounded-2xl p-4 items-center h-32" style={{ backgroundColor: colors.teal }}>
            <Clock size={28} color={colors.void} weight="fill" />
            <Text className="font-bold text-xl mt-2" style={{ color: colors.void }}>{totalPlaytime}</Text>
            <Text className="text-sm font-semibold" style={{ color: alpha(colors.void, 0.75), alignSelf: 'stretch', textAlign: 'center' }}>Total Time</Text>
          </View>

          {/* Achievements */}
          <View className="w-[48%] mb-4 rounded-2xl p-4 items-center h-32" style={{ backgroundColor: colors.gold }}>
            <Trophy size={28} color={colors.void} weight="fill" />
            <Text className="font-bold text-2xl mt-2" style={{ color: colors.void }}>{userStats.achievements}</Text>
            <Text className="text-sm font-semibold" style={{ color: alpha(colors.void, 0.75), alignSelf: 'stretch', textAlign: 'center' }}>Achievements</Text>
          </View>

          {/* Join Date */}
          <View className="w-[48%] mb-4 rounded-2xl p-4 items-center h-32" style={{ backgroundColor: colors.cyan }}>
            <Calendar size={28} color={colors.void} weight="fill" />
            <Text className="font-bold text-lg mt-2" style={{ color: colors.void }}>{joinDate}</Text>
            <Text className="text-sm font-semibold" style={{ color: alpha(colors.void, 0.75), alignSelf: 'stretch', textAlign: 'center' }}>Member Since</Text>
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
              <View key={index} className="bg-[#12171E] px-4 py-3 rounded-full border border-[#232C37]">
                <Text className="text-white font-medium">{genre}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-[#12171E] rounded-xl p-6 border border-[#232C37] items-center">
            <GameController size={32} color="#AEB9C4" weight="bold" />
            <Text className="text-white font-bold text-lg mt-3 mb-2">No Favorite Genres Yet</Text>
            <Text className="text-[#AEB9C4] text-center leading-5">
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
        {achievements && achievements.length > 0 ? (
          <View className="space-y-3">
            {achievements.filter(achievement => achievement && achievement.id).slice(0, 3).map((achievement) => {
              // Safety check for achievement object
              if (!achievement || !achievement.id) {
                return null;
              }
              
              const IconComponent = achievement.icon || Trophy; // Fallback to Trophy icon
              
              return (
                <View key={achievement.id} className={`bg-[#12171E] rounded-xl p-4 mt-2 border ${
                  achievement.unlocked ? 'border-[#14C8B0]/30' : 'border-[#232C37]'
                } ${!achievement.unlocked ? 'opacity-60' : ''}`}>
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-full justify-center items-center mr-4"
                      style={{ backgroundColor: achievement.unlocked ? achievement.color : '#232C37' }}
                    >
                      <IconComponent
                        size={24}
                        color={achievement.unlocked ? '#FFFFFF' : '#6E7B88'}
                        weight="fill"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold text-base ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.title || 'Unknown Achievement'}
                      </Text>
                      <Text className={`text-sm mt-1 ${
                        achievement.unlocked ? 'text-[#AEB9C4]' : 'text-gray-500'
                      }`}>
                        {achievement.description || 'No description available'}
                      </Text>
                    </View>
                    {achievement.unlocked && (
                      <CheckCircle size={20} color="#34D399" weight="fill" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="bg-[#12171E] rounded-xl p-6 border border-[#232C37] items-center">
            <Trophy size={32} color="#AEB9C4" weight="bold" />
            <Text className="text-white font-bold text-lg mt-3 mb-2">No Achievements Yet</Text>
            <Text className="text-[#AEB9C4] text-center leading-5">
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
            <View key={item.id} className="bg-[#12171E] rounded-2xl p-4 border border-[#232C37]">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: item.gameImage }}
                  className="w-14 h-14 rounded-xl"
                />
                <View className="flex-1 ml-4">
                  <Text className="font-bold text-base text-white mb-1">{item.game}</Text>
                  <Text className="text-[#AEB9C4] text-sm mb-2">{item.action}</Text>
                  {item.rating && (
                    <View className="flex-row items-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          color={star <= (item.rating || 0) ? '#FBBF24' : '#232C37'}
                          weight={star <= (item.rating || 0) ? 'fill' : 'regular'}
                        />
                      ))}
                    </View>
                  )}
                  <Text className="text-xs text-[#6E7B88]">{item.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-20">
          <View className="w-20 h-20 rounded-full bg-[#12171E] justify-center items-center mb-4 border border-[#232C37]">
            <GameController size={32} color="#AEB9C4" weight="bold" />
          </View>
          <Text className="text-white text-xl font-bold mb-2">No Activity Yet</Text>
          <Text className="text-[#AEB9C4] text-center px-8">
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
      <View className="bg-[#12171E] rounded-2xl p-5 mb-6 border border-[#232C37]">
        <View className="space-y-4">
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <Calendar size={20} color="#14C8B0" weight="fill" />
              <Text className="text-[#AEB9C4] ml-3 font-medium">Member Since</Text>
            </View>
            <Text className="font-bold text-white text-lg">{joinDate}</Text>
          </View>
          
          <View className="h-px bg-[#232C37]" />
          
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <GameController size={20} color="#14C8B0" weight="fill" />
              <Text className="text-[#AEB9C4] ml-3 font-medium">Games Played</Text>
            </View>
            <Text className="font-bold text-white text-lg">{gamesCount}</Text>
          </View>
          
          <View className="h-px bg-[#232C37]" />
          
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <Clock size={20} color="#14C8B0" weight="fill" />
              <Text className="text-[#AEB9C4] ml-3 font-medium">Total Playtime</Text>
            </View>
            <Text className="font-bold text-white text-lg">{totalPlaytime}</Text>
          </View>
          
          <View className="h-px bg-[#232C37]" />
          
          <View className="flex-row justify-between items-center py-2">
            <View className="flex-row items-center">
              <Star size={20} color="#14C8B0" weight="fill" />
              <Text className="text-[#AEB9C4] ml-3 font-medium">Reviews Written</Text>
            </View>
            <Text className="font-bold text-white text-lg">{reviewsCount}</Text>
          </View>
        </View>
      </View>
      
      {/* Streak Stats */}
      <View className="bg-[#12171E] rounded-2xl p-5 border border-[#232C37]">
        <Text className="font-bold text-lg text-white mb-4">Activity Streaks</Text>
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Fire size={18} color="#EF4444" weight="fill" />
              <Text className="text-[#AEB9C4] ml-3 font-medium">Current Streak</Text>
            </View>
            <Text className="font-bold text-white">{userStats.currentStreak} days</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Crown size={18} color="#FBBF24" weight="fill" />
              <Text className="text-[#AEB9C4] ml-3 font-medium">Longest Streak</Text>
            </View>
            <Text className="font-bold text-white">{userStats.longestStreak} days</Text>
          </View>
        </View>
      </View>
    </View>
  );


  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <LinearGradient
        colors={gradients.screen}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 justify-center items-center">
          <View className="w-16 h-16 rounded-full bg-[#14C8B0] justify-center items-center mb-4">
            <GameController size={32} color="#FFFFFF" weight="fill" />
          </View>
          <Text className="text-white text-xl font-bold mb-2">Loading Profile...</Text>
          <Text className="text-[#AEB9C4] text-center px-8">
            Please wait while we load your profile data
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Show guest user state if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <LinearGradient
        colors={gradients.screen}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 rounded-full bg-[#12171E] justify-center items-center mb-6 border border-[#232C37]">
            <GameController size={40} color="#AEB9C4" weight="bold" />
          </View>
          <Text className="text-white text-2xl font-bold mb-4 text-center">Welcome to GameLog!</Text>
          <Text className="text-[#AEB9C4] text-center mb-8 leading-6">
            Sign in to track your games, write reviews, and unlock achievements
          </Text>
          <TouchableOpacity
            className="bg-[#14C8B0] py-4 px-8 rounded-xl"
            onPress={() => router.push('/settings' as any)}
          >
            <Text className="text-white font-bold text-lg">Go to Settings</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <Text className="font-bold text-[24px]" style={{ color: colors.text }}>Profile</Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            onPress={() => router.push('/settings' as any)}
          >
            <Gear size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 120 : 100 }}
        >
          <View className="px-5 pb-8">
            {/* Profile Header */}
            <View className="items-center mb-8">
              <TouchableOpacity
                className="relative mb-6"
                onPress={() => setShowAvatarModal(true)}
              >
                <View
                  style={{ width: 116, height: 116, borderRadius: 58, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.teal, ...glow(colors.teal, 0.5, 18) }}
                >
                  <View className="w-[108px] h-[108px] rounded-full overflow-hidden" style={{ borderWidth: 3, borderColor: colors.bg }}>
                    <Image source={{ uri: selectedAvatar }} className="w-full h-full rounded-full" />
                    {uploadingAvatar && (
                      <View className="absolute inset-0 rounded-full justify-center items-center" style={{ backgroundColor: 'rgba(6,9,13,0.6)' }}>
                        <ActivityIndicator color={colors.teal} />
                      </View>
                    )}
                  </View>
                </View>
                <View
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.teal, borderWidth: 3, borderColor: colors.bg, ...glow(colors.teal, 0.6, 8) }}
                >
                  <Camera size={18} color={colors.void} weight="fill" />
                </View>
              </TouchableOpacity>

              <Text className="font-bold text-3xl mb-2" style={{ color: colors.text }}>
                {userName}
              </Text>

              {/* Rank + level chip */}
              <View className="flex-row items-center px-3 py-1.5 rounded-full mb-3" style={{ backgroundColor: alpha(colors.teal, 0.14), borderWidth: 1, borderColor: alpha(colors.teal, 0.3) }}>
                <Trophy size={13} color={colors.tealBright} weight="fill" />
                <Text className="font-bold text-xs ml-1.5" style={{ color: colors.tealBright }}>{rank} · Level {level}</Text>
              </View>

              {/* Bio Section - Beautiful Design */}
              <View className="mb-6">
                <View className="bg-[#12171E] rounded-2xl p-5 border border-[#232C37] min-w-full shadow-lg">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 min-w-full">
                      {/* <Text className="text-[#14C8B0] text-sm font-semibold mb-1">About Me</Text> */}
                      <Text className="text-[#F2F6F8] text-base leading-6">
                        {userStats.bio || "Tell others about your gaming interests, favorite genres, or what you're currently playing..."}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    className="py-3 px-4 rounded-xl flex-row items-center justify-center"
                    style={{ backgroundColor: colors.teal }}
                    activeOpacity={0.9}
                    onPress={handleEditBio}
                  >
                    <Text className="font-bold text-sm" style={{ color: colors.void }}>Edit Bio</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Quick Stats */}
              <View className="flex-row space-x-6 mt-2">
                <View className="items-center">
                  <Text className="font-bold text-2xl text-white">{gamesCount}</Text>
                  <Text className="text-[#AEB9C4] text-sm mt-1">Games</Text>
                </View>
                <View className="items-center">
                  <Text className="font-bold text-2xl text-white">{reviewsCount}</Text>
                  <Text className="text-[#AEB9C4] text-sm mt-1">Reviews</Text>
                </View>
                <View className="items-center">
                  <Text className="font-bold text-2xl text-white">{listsCount}</Text>
                  <Text className="text-[#AEB9C4] text-sm mt-1">Lists</Text>
                </View>
              </View>
            </View>

            {/* Navigation Tabs */}
            <View className="flex-row mb-6 gap-2.5">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'activity', label: 'Activity' },
                { id: 'stats', label: 'Stats' },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <TouchableOpacity key={tab.id} className="flex-1 rounded-2xl overflow-hidden" activeOpacity={0.85} onPress={() => setActiveTab(tab.id)}>
                    {active ? (
                      <View className="py-3" style={{ backgroundColor: colors.teal, ...glow(colors.teal, 0.4, 10) }}>
                        <Text className="font-bold text-center" style={{ color: colors.void }}>{tab.label}</Text>
                      </View>
                    ) : (
                      <View className="py-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                        <Text className="font-semibold text-center" style={{ color: colors.textDim }}>{tab.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
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
            <View className="bg-[#12171E] rounded-t-3xl p-6 border-t border-[#232C37]">
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
                        ? 'border-[#14C8B0]'
                        : 'border-[#232C37]'
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
                className="mt-6 bg-[#14C8B0] py-3 px-4 rounded-xl flex-row items-center justify-center"
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

        {/* Bio Editing Modal */}
        <Modal
          visible={showBioModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelBio}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <View className="bg-[#12171E] rounded-2xl p-6 border border-[#232C37] w-full max-w-md shadow-2xl">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="font-bold text-xl text-white">
                  {isEditingBio ? 'Edit Bio' : 'Add Bio'}
                </Text>
                <TouchableOpacity
                  className="w-10 h-10 rounded-full justify-center items-center"
                  onPress={handleCancelBio}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TextInput
                className="bg-[#0A0E13] border border-[#232C37] rounded-xl p-4 text-white text-lg mb-6 min-h-[120px]"
                placeholder="Tell others about your gaming interests, favorite genres, or what you're currently playing..."
                placeholderTextColor="#6E7B88"
                value={bioText}
                onChangeText={setBioText}
                multiline={true}
                textAlignVertical="top"
                maxLength={200}
              />

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-[#232C37] py-3 px-4 rounded-xl"
                  onPress={handleCancelBio}
                >
                  <Text className="text-white font-medium text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-[#14C8B0] py-3 px-4 rounded-xl"
                  onPress={handleSaveBio}
                >
                  <Text className="text-white font-medium text-center">
                    Save Bio
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-[#6E7B88] text-sm text-center mt-3">
                {bioText.length}/200 characters
              </Text>
            </View>
          </View>
        </Modal>
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

