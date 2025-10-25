import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameCard } from '@/components/GameCard';
import { Header } from '@/components/Header';
import AppContent from '@/components/AppContent';
import { useFeaturedGames, useTrendingGames, usePopularGames, useTopRatedGames, useUpcomingGames, useIndieGames, useRecentlyReleasedGames, useMostAnticipatedGames } from '@/hooks/useGames';
import { IGDBGame } from '@/services/igdbService';
import {
  Star,
  Play,
  Heart,
  TrendUp,
  GameController,
  Sparkle,
  Fire,
  Lightning,
  Crown,
  Trophy,
  Clock,
  Calendar,
  Rocket,
} from 'phosphor-react-native';

function FeaturedGameCard({ game }: { game: IGDBGame }) {
  // Mock additional properties for featured games styling
  const mockStatus = 'hot';
  const isNew = Math.random() > 0.5; // Random for demo purposes
  
  const handlePress = () => {
    // Safety check to ensure game.id exists
    if (!game || !game.id) {
      console.warn('FeaturedGameCard: Invalid game data or missing ID', game);
      return;
    }
    
    router.push({
      pathname: '/game/[id]',
      params: { id: game.id.toString() }
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return '#FF4757';
      case 'trending':
        return '#9146FF';
      case 'champion':
        return '#FFD700';
      case 'classic':
        return '#00B5AD';
      default:
        return '#9146FF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hot':
        return Fire;
      case 'trending':
        return TrendUp;
      case 'champion':
        return Crown;
      case 'classic':
        return Trophy;
      default:
        return Fire;
    }
  };

  const StatusIcon = getStatusIcon(mockStatus);
  const statusColor = getStatusColor(mockStatus);

  return (
    <TouchableOpacity
      className="w-[280px] h-[360px] mr-5 relative "
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {/* Animated border glow */}
      <View
        className={`absolute -top-.5 -left-1.5 -right-1.5 -bottom-1.5 rounded-[22px] shadow-lg`}
        style={{
          shadowColor: statusColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 20,
        }}
      />

      {/* Main card container */}
      <View className="flex-1 rounded-3xl overflow-hidden bg-[#18181B] border-2 border-white/20">
        <Image
          source={{ uri: game.cover?.url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop' }}
          className="w-full h-full absolute"
          
        />

        {/* Cyber grid overlay */}
        <View
          className="absolute inset-0 bg-transparent opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(145, 70, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(145, 70, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Multiple gradient layers for depth */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.98)']}
          className="absolute bottom-0 left-0 right-0 h-[65%] justify-end p-5"
        />

        {/* Neon accent line */}
        <View
          className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{
            backgroundColor: statusColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 8,
          }}
        />

        <View className="flex-1 justify-between z-10">
          {/* Top badges row */}
          <View className="flex-row justify-between items-start px-2 pt-2">
            <View className="flex-row gap-1.5  ">
              {isNew && (
                <View
                  className="flex-row items-center px-2.5 py-1 rounded-[12px] gap-1 border-2 bg-[rgba(255,107,107,0.9)] border-[#FF6B6B]"
                  style={{
                    shadowColor: '#FF6B6B',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.7,
                    shadowRadius: 7,
                  }}
                >
                  <Sparkle size={10} color="#FFFFFF" weight="fill" />
                  <Text className="font-bold text-xs text-white tracking-wide">
                    NEW
                  </Text>
                </View>
              )}
            </View>
            <View
              className="flex-row items-center px-2.5 py-1 rounded-[12px] gap-1 border-2"
              style={{
                backgroundColor: statusColor + '20',
                borderColor: statusColor,
                shadowColor: statusColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 7,
              }}
            >
              <StatusIcon size={10} color={statusColor} weight="fill" />
              <Text
                className="font-bold text-xs tracking-wide"
                style={{ color: statusColor }}
              >
                {mockStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Bottom content */}
          <View className="gap-3 ml-2">
            <Text
              className="font-bold text-2xl text-white leading-7 shadow-text tracking-wide mb-1"
              numberOfLines={2}
            >
              {game.name}
            </Text>

            <View className="gap-2">
              <View className="flex-row justify-between items-center ml-2 mr-2">
                <View
                  className={`px-3 py-2 rounded-xl border-2 border-opacity-60 shadow-sm`}
                  style={{
                    backgroundColor: statusColor + '20',
                    borderColor: statusColor + '60',
                    shadowColor: statusColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 5,
                  }}
                >
                  <Text
                    style={{ color: statusColor }}
                    className="font-bold text-xs tracking-wide"
                  >
                    {game.genres && game.genres.length > 0 ? game.genres[0].name : 'Unknown'}
                  </Text>
                </View>

                <View className="items-end">
                  <View
                    className="bg-black/90 rounded-xl px-3 py-2 flex-row items-center border-2 border-[#FFD700] shadow-md"
                    style={{
                      shadowColor: '#FFD700',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.7,
                      shadowRadius: 7,
                    }}
                  >
                    <Star size={12} color="#FFD700" weight="fill" />
                    <Text className="font-bold text-xs text-[#FFD700] ml-1.5">
                      {game.rating ? (game.rating / 10).toFixed(1) : '?'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress bar for rating */}
              <View className="mt-2">
                <View className="h-[5px] bg-white/20 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full shadow-md"
                    style={{
                      width: `${game.rating ? (game.rating / 100) * 100 : 0}%`,
                      backgroundColor: statusColor,
                      shadowColor: statusColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 5,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Corner decorations */}
        <View
          className="absolute top-3 left-3 w-7 h-7 border-3 border-r-0 border-b-0 rounded-tl-xl"
          style={{
            borderColor: statusColor,
            shadowColor: statusColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />
        <View
          className="absolute bottom-3 right-3 w-7 h-7 border-3 border-l-0 border-t-0 rounded-br-xl"
          style={{
            borderColor: statusColor,
            shadowColor: statusColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  onPress,
  color,
}: {
  title: string;
  icon: any;
  onPress?: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center mb-5"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="w-9 h-9 rounded-[18px] justify-center items-center border border-white/10 shadow-lg"
          style={{
            backgroundColor: color + '20',
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Icon size={18} color={color} weight="fill" />
        </View>
        <View>
          <Text style={{ color }} className="font-bold text-xl">
            {title}
          </Text>
          <View
            style={{ backgroundColor: color }}
            className="h-0.5 w-[60%] mt-0.5 rounded-sm"
          />
        </View>
      </View>
      <TouchableOpacity
        style={{ backgroundColor: color + '15', borderColor: color + '30' }}
        className="w-8 h-8 rounded-2xl justify-center items-center border"
      >
        <Text style={{ color }} className="font-semibold text-base">
          →
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function HomeContent() {
  const { data: featuredGames, isLoading: featuredLoading, error: featuredError } = useFeaturedGames();
  const { data: trendingGames, isLoading: trendingLoading, error: trendingError } = useTrendingGames();
  const { data: popularGames, isLoading: popularLoading, error: popularError } = usePopularGames();
  const { data: topRatedGames, isLoading: topRatedLoading, error: topRatedError } = useTopRatedGames();
  const { data: upcomingGames, isLoading: upcomingLoading, error: upcomingError } = useUpcomingGames();
  const { data: indieGames, isLoading: indieLoading, error: indieError } = useIndieGames();
  const { data: recentlyReleasedGames, isLoading: recentlyReleasedLoading, error: recentlyReleasedError } = useRecentlyReleasedGames();
  const { data: mostAnticipatedGames, isLoading: mostAnticipatedLoading, error: mostAnticipatedError } = useMostAnticipatedGames();

  return (
    <LinearGradient
      colors={['#0E0E10', '#18181B', '#1F1F23']}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 120 : 100 }}
        >
          <View className="p-5">
            {/* Enhanced Welcome Section */}
            <View className="mb-8 py-5 relative overflow-hidden">
              <Text className="font-bold text-[28px] text-white mb-1.5 flex-row items-center">
                Welcome back,{' '}
                <Text className="text-[#9146FF] shadow-neon-blue">Gamer</Text>
              </Text>
              <Text className="font-normal text-base text-[#A0A0A0] mb-5">
                Ready to level up your gaming experience?
              </Text>
            </View>

            {/* Featured Games */}
            <View className="mb-8">
              <SectionHeader
                title="Featured Games"
                icon={Heart}
                color="#FF4757"
              />
              {featuredLoading ? (
                <View className="h-[360px] justify-center items-center">
                  <ActivityIndicator size="large" color="#FF4757" />
                </View>
              ) : featuredError ? (
                <View className="h-[360px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load featured games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {featuredGames?.map((game: IGDBGame) => (
                    <FeaturedGameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Trending Now */}
            <View className="mb-8">
              <SectionHeader title="Trending Now" icon={Fire} color="#9146FF" />
              {trendingLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator size="large" color="#9146FF" />
                </View>
              ) : trendingError ? (
                <View className="h-[200px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load trending games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {trendingGames?.map((game: IGDBGame) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Popular This Week */}
            <View className="mb-8">
              <SectionHeader
                title="Popular This Week"
                icon={Lightning}
                color="#FFD700"
              />
              {popularLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator size="large" color="#FFD700" />
                </View>
              ) : popularError ? (
                <View className="h-[200px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load popular games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {popularGames?.map((game: IGDBGame) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Top Rated Games */}
            <View className="mb-8">
              <SectionHeader
                title="Top Rated Games"
                icon={Trophy}
                color="#00B5AD"
              />
              {topRatedLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator size="large" color="#00B5AD" />
                </View>
              ) : topRatedError ? (
                <View className="h-[200px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load top rated games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {topRatedGames?.map((game: IGDBGame) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Upcoming Games */}
            <View className="mb-8">
              <SectionHeader
                title="Upcoming Games"
                icon={GameController}
                color="#9146FF"
              />
              {upcomingLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator size="large" color="#9146FF" />
                </View>
              ) : upcomingError ? (
                <View className="h-[200px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load upcoming games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {upcomingGames?.map((game: IGDBGame) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Indie Games */}
            <View className="mb-8">
              <SectionHeader
                title="Indie Games"
                icon={Sparkle}
                color="#FFD700"
              />
              {indieLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator size="large" color="#FFD700" />
                </View>
              ) : indieError ? (
                <View className="h-[200px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load indie games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {indieGames?.map((game: IGDBGame) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Recently Released Games */}
            <View className="mb-8">
              <SectionHeader
                title="Recently Released"
                icon={Clock}
                color="#00B5AD"
              />
              {recentlyReleasedLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator size="large" color="#00B5AD" />
                </View>
              ) : recentlyReleasedError ? (
                <View className="h-[200px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load recently released games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {recentlyReleasedGames?.map((game: IGDBGame) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Most Anticipated Games */}
            <View className="mb-8">
              <SectionHeader
                title="Most Anticipated"
                icon={Rocket}
                color="#FF4757"
              />
              {mostAnticipatedLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator size="large" color="#FF4757" />
                </View>
              ) : mostAnticipatedError ? (
                <View className="h-[200px] justify-center items-center">
                  <Text className="text-white text-center">Failed to load most anticipated games</Text>
                  <Text className="text-gray-400 text-sm mt-2">Please check your internet connection</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-5"
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {mostAnticipatedGames?.map((game: IGDBGame) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Enhanced Quick Actions */}
            <View className="flex-row justify-between mt-6 mb-10 gap-3">
              <TouchableOpacity
                className="flex-1 items-center p-5 rounded-2xl border border-white/10 relative overflow-hidden bg-[#FF475715]"
                activeOpacity={0.8}
              >
                <View className="absolute -top-12 -left-12 -right-12 -bottom-12 bg-white/[0.02] rounded-[50px]" />
                <View className="w-12 h-12 rounded-3xl justify-center items-center mb-3 border border-white/10 bg-[#FF475720]">
                  <Play size={20} color="#FF4757" weight="fill" />
                </View>
                <Text className="font-semibold text-xs text-white text-center mb-1">
                  Log Game
                </Text>
                <Text className="font-normal text-[9px] text-[#A0A0A0] text-center">
                  Track your progress
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center p-5 rounded-2xl border border-white/10 relative overflow-hidden bg-[#9146FF15]"
                activeOpacity={0.8}
              >
                <View className="absolute -top-12 -left-12 -right-12 -bottom-12 bg-white/[0.02] rounded-[50px]" />
                <View className="w-12 h-12 rounded-3xl justify-center items-center mb-3 border border-white/10 bg-[#9146FF20]">
                  <Star size={20} color="#9146FF" weight="fill" />
                </View>
                <Text className="font-semibold text-xs text-white text-center mb-1">
                  Rate Game
                </Text>
                <Text className="font-normal text-[9px] text-[#A0A0A0] text-center">
                  Share your review
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center p-5 rounded-2xl border border-white/10 relative overflow-hidden bg-[#FFD70015]"
                activeOpacity={0.8}
              >
                <View className="absolute -top-12 -left-12 -right-12 -bottom-12 bg-white/[0.02] rounded-[50px]" />
                <View className="w-12 h-12 rounded-3xl justify-center items-center mb-3 border border-white/10 bg-[#FFD70020]">
                  <Heart size={20} color="#FFD700" weight="fill" />
                </View>
                <Text className="font-semibold text-xs text-white text-center mb-1">
                  Wishlist
                </Text>
                <Text className="font-normal text-[9px] text-[#A0A0A0] text-center">
                  Save for later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function HomeScreen() {
  return (
    <AppContent>
      <HomeContent />
    </AppContent>
  );
}
