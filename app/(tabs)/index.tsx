import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameCard } from '@/components/GameCard';
import AppContent from '@/components/AppContent';
import { useAuth } from '@/hooks/useAuth';
import { useFeaturedGames, useTrendingGames, usePopularGames, useTopRatedGames, useUpcomingGames, useIndieGames, useRecentlyReleasedGames, useMostAnticipatedGames, useHiddenGems } from '@/hooks/useGames';
import SteamConnectBanner from '@/components/SteamConnectBanner';
import { IGDBGame } from '@/services/igdbService';
import { colors, gradients, accents, glow, alpha } from '@/constants/theme';
import {
  Star,
  Play,
  Heart,
  GameController,
  Sparkle,
  Fire,
  Lightning,
  Trophy,
  Clock,
  Rocket,
  Diamond,
  CaretRight,
} from 'phosphor-react-native';

function FeaturedGameCard({ game }: { game: IGDBGame }) {
  const isNew = game.id % 2 === 0; // stable per-game
  const accent = accents.featured.color;

  const handlePress = () => {
    if (!game || !game.id) return;
    router.push({ pathname: '/game/[id]', params: { id: game.id.toString() } });
  };

  const rating = game.rating ? (game.rating / 10).toFixed(1) : null;
  const genre = game.genres && game.genres.length > 0 ? game.genres[0].name : 'Unknown';

  return (
    <TouchableOpacity className="w-[290px] h-[370px] mr-5" activeOpacity={0.9} onPress={handlePress}>
      <View
        className="flex-1 rounded-[26px] overflow-hidden"
        style={{ borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, ...glow(accent, 0.35, 20) }}
      >
        <Image
          source={{ uri: game.cover?.url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop' }}
          className="w-full h-full absolute"
        />

        {/* Top badges */}
        <View className="flex-row justify-between items-start p-4">
          {isNew ? (
            <View className="flex-row items-center px-3 py-1.5 gap-1 rounded-full" style={{ backgroundColor: colors.green }}>
              <Sparkle size={11} color={colors.void} weight="fill" />
              <Text className="font-bold text-[11px] tracking-wider" style={{ color: colors.void }}>NEW</Text>
            </View>
          ) : <View />}
          <View className="flex-row items-center px-3 py-1.5 gap-1 rounded-full" style={{ backgroundColor: accent }}>
            <Fire size={11} color={colors.void} weight="fill" />
            <Text className="font-bold text-[11px] tracking-wider" style={{ color: colors.void }}>HOT</Text>
          </View>
        </View>

        {/* Bottom content */}
        <View className="absolute bottom-0 left-0 right-0 p-5">
          <Text
            className="font-bold text-[26px] leading-[30px] mb-3"
            style={{ color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 }}
            numberOfLines={2}
          >
            {game.name}
          </Text>

          <View className="flex-row items-center justify-between mb-3">
            <View className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.teal }}>
              <Text className="font-bold text-[11px] uppercase tracking-wide" style={{ color: colors.void }}>{genre}</Text>
            </View>
            {rating && (
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{ backgroundColor: alpha(colors.void, 0.75), borderWidth: 1, borderColor: alpha(colors.gold, 0.6) }}
              >
                <Star size={13} color={colors.gold} weight="fill" />
                <Text className="font-bold text-sm ml-1.5" style={{ color: colors.gold }}>{rating}</Text>
              </View>
            )}
          </View>

          {/* Rating meter */}
          <View className="h-[6px] rounded-full overflow-hidden" style={{ backgroundColor: alpha('#FFFFFF', 0.14) }}>
            <View style={{ height: '100%', borderRadius: 999, backgroundColor: accent, width: `${game.rating ? Math.min(game.rating, 100) : 0}%` }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  color,
  onPress,
}: {
  title: string;
  icon: any;
  color: string;
  onPress?: () => void;
}) {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View className="flex-row items-center gap-3">
        <View
          style={{ width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: color, ...glow(color, 0.4, 10) }}
        >
          <Icon size={19} color={colors.void} weight="fill" />
        </View>
        <View>
          <Text className="font-bold text-[19px]" style={{ color: colors.text }}>{title}</Text>
          <View className="h-[3px] w-12 mt-1 rounded-full" style={{ backgroundColor: color }} />
        </View>
      </View>
      <TouchableOpacity
        onPress={onPress}
        className="w-9 h-9 rounded-full justify-center items-center"
        style={{ backgroundColor: alpha(color, 0.14), borderWidth: 1, borderColor: alpha(color, 0.3) }}
      >
        <CaretRight size={16} color={color} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

function GameRow({
  title,
  icon,
  color,
  data,
  loading,
  error,
  category,
}: {
  title: string;
  icon: any;
  color: string;
  data?: IGDBGame[];
  loading: boolean;
  error: unknown;
  category: string;
}) {
  const seeAll = () => router.push({ pathname: '/games/[category]', params: { category } });
  return (
    <View className="mb-8">
      <SectionHeader title={title} icon={icon} color={color} onPress={seeAll} />
      {loading ? (
        <View className="h-[220px] justify-center items-center">
          <ActivityIndicator size="large" color={color} />
        </View>
      ) : error ? (
        <View className="h-[220px] justify-center items-center px-6">
          <Text className="text-center" style={{ color: colors.textDim }}>Couldn't load {title.toLowerCase()}</Text>
          <Text className="text-sm mt-1.5" style={{ color: colors.textMuted }}>Check your connection and try again</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
          {data?.map((game: IGDBGame) => <GameCard key={game.id} game={game} />)}
        </ScrollView>
      )}
    </View>
  );
}

function QuickAction({ icon: Icon, label, sub, color }: { icon: any; label: string; sub: string; color: string }) {
  return (
    <TouchableOpacity
      className="flex-1 items-center p-4 rounded-[20px]"
      activeOpacity={0.85}
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: alpha(color, 0.28) }}
    >
      <View
        style={{ width: 46, height: 46, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10, backgroundColor: color, ...glow(color, 0.4, 10) }}
      >
        <Icon size={20} color={colors.void} weight="fill" />
      </View>
      <Text className="font-bold text-[12px] text-center" style={{ color: colors.text }}>{label}</Text>
      <Text className="font-normal text-[10px] text-center mt-0.5" style={{ color: colors.textMuted }}>{sub}</Text>
    </TouchableOpacity>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const featured = useFeaturedGames();
  const trending = useTrendingGames();
  const popular = usePopularGames();
  const topRated = useTopRatedGames();
  const upcoming = useUpcomingGames();
  const indie = useIndieGames();
  const recent = useRecentlyReleasedGames();
  const anticipated = useMostAnticipatedGames();
  const gems = useHiddenGems();

  const name = user?.username || 'Gamer';

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          <View className="p-5">
            {/* Welcome */}
            <View className="mb-8 mt-1">
              <Text className="font-bold text-[30px] leading-9" style={{ color: colors.text }}>
                Welcome back,{'\n'}
                <Text style={{ color: colors.teal }}>{name}</Text>
              </Text>
              <Text className="font-normal text-base mt-2" style={{ color: colors.textDim }}>
                Ready to level up your gaming experience?
              </Text>
            </View>

            {/* Steam import (one-time, dismissible) */}
            <SteamConnectBanner />

            {/* Featured */}
            <View className="mb-8">
              <SectionHeader title="Featured Games" icon={Heart} color={accents.featured.color} onPress={() => router.push({ pathname: '/games/[category]', params: { category: 'featured' } })} />
              {featured.isLoading ? (
                <View className="h-[370px] justify-center items-center">
                  <ActivityIndicator size="large" color={accents.featured.color} />
                </View>
              ) : featured.error ? (
                <View className="h-[370px] justify-center items-center px-6">
                  <Text className="text-center" style={{ color: colors.textDim }}>Couldn't load featured games</Text>
                  <Text className="text-sm mt-1.5" style={{ color: colors.textMuted }}>Check your connection and try again</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerStyle={{ paddingHorizontal: 20 }}>
                  {featured.data?.map((game: IGDBGame) => <FeaturedGameCard key={game.id} game={game} />)}
                </ScrollView>
              )}
            </View>

            <GameRow title="Trending Now" icon={Fire} color={accents.trending.color} data={trending.data} loading={trending.isLoading} error={trending.error} category="trending" />
            <GameRow title="Popular This Week" icon={Lightning} color={accents.popular.color} data={popular.data} loading={popular.isLoading} error={popular.error} category="popular" />
            <GameRow title="Top Rated Games" icon={Trophy} color={accents.top.color} data={topRated.data} loading={topRated.isLoading} error={topRated.error} category="top-rated" />
            <GameRow title="Upcoming Games" icon={GameController} color={accents.upcoming.color} data={upcoming.data} loading={upcoming.isLoading} error={upcoming.error} category="upcoming" />
            <GameRow title="Indie Games" icon={Sparkle} color={accents.indie.color} data={indie.data} loading={indie.isLoading} error={indie.error} category="indie" />
            <GameRow title="Hidden Gems" icon={Diamond} color={colors.lime} data={gems.data} loading={gems.isLoading} error={gems.error} category="gems" />
            <GameRow title="Recently Released" icon={Clock} color={accents.recent.color} data={recent.data} loading={recent.isLoading} error={recent.error} category="recent" />
            <GameRow title="Most Anticipated" icon={Rocket} color={accents.anticipated.color} data={anticipated.data} loading={anticipated.isLoading} error={anticipated.error} category="anticipated" />

            {/* Quick actions */}
            <View className="flex-row gap-3 mt-2 mb-1">
              <QuickAction icon={Play} label="Log Game" sub="Track your progress" color={colors.coral} />
              <QuickAction icon={Star} label="Rate Game" sub="Share your review" color={colors.teal} />
              <QuickAction icon={Heart} label="Wishlist" sub="Save for later" color={colors.gold} />
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
