import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GameController, CaretLeft, CaretRight } from 'phosphor-react-native';
import { GameCard } from '@/components/GameCard';
import { igdbService, IGDBGame } from '@/services/igdbService';
import { colors, gradients, accents, glow, alpha } from '@/constants/theme';

const FETCH_LIMIT = 60; // pulled once, then paginated client-side
const PER_PAGE = 20;

// Map a category slug to its title, accent color, and data fetcher.
const CATEGORIES: Record<string, { title: string; color: string; fetch: (n: number) => Promise<IGDBGame[]> }> = {
  featured: { title: 'Featured Games', color: accents.featured.color, fetch: (n) => igdbService.getFeaturedGames(n) },
  trending: { title: 'Trending Now', color: accents.trending.color, fetch: (n) => igdbService.getTrendingGames(n) },
  popular: { title: 'Popular This Week', color: accents.popular.color, fetch: (n) => igdbService.getPopularGames(n) },
  'top-rated': { title: 'Top Rated Games', color: accents.top.color, fetch: (n) => igdbService.getTopRatedGames(n) },
  upcoming: { title: 'Upcoming Games', color: accents.upcoming.color, fetch: (n) => igdbService.getUpcomingGames(n) },
  indie: { title: 'Indie Games', color: accents.indie.color, fetch: (n) => igdbService.getIndieGames(n) },
  recent: { title: 'Recently Released', color: accents.recent.color, fetch: (n) => igdbService.getRecentlyReleasedGames(n) },
  anticipated: { title: 'Most Anticipated', color: accents.anticipated.color, fetch: (n) => igdbService.getMostAnticipatedGames(n) },
  gems: { title: 'Hidden Gems', color: colors.lime, fetch: (n) => igdbService.getHiddenGems(n) },
};

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const cfg = CATEGORIES[category as string];
  const { width } = useWindowDimensions();
  const [page, setPage] = React.useState(1);
  const scrollRef = React.useRef<ScrollView>(null);

  // 2-column grid sizing.
  const H_PAD = 16;
  const GAP = 14;
  const itemW = Math.floor((width - H_PAD * 2 - GAP) / 2);

  const { data, isLoading, error } = useQuery({
    queryKey: ['category', category],
    queryFn: () => cfg.fetch(FETCH_LIMIT),
    enabled: !!cfg,
    staleTime: 10 * 60 * 1000,
  });

  const games = data || [];
  const totalPages = Math.max(1, Math.ceil(games.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageGames = games.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goToPage = (p: number) => {
    setPage(p);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.push('/'));
  const accent = cfg?.color || colors.teal;

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View className="flex-row items-center gap-3 px-5 pt-2 pb-4">
          <TouchableOpacity
            onPress={goBack}
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <ArrowLeft size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-3 flex-1">
            <View style={{ width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: accent, ...glow(accent, 0.4, 10) }}>
              <GameController size={18} color={colors.void} weight="fill" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-[22px]" style={{ color: colors.text }} numberOfLines={1}>{cfg?.title || 'Games'}</Text>
              {games.length > 0 && (
                <Text className="text-xs" style={{ color: colors.textMuted }}>{games.length} games</Text>
              )}
            </View>
          </View>
        </View>

        {!cfg ? (
          <View className="flex-1 justify-center items-center px-8">
            <Text className="text-center" style={{ color: colors.textDim }}>Unknown category.</Text>
          </View>
        ) : isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={accent} />
          </View>
        ) : error || games.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <Text className="text-center" style={{ color: colors.textDim }}>{error ? `Couldn't load ${cfg.title.toLowerCase()}` : 'No games found'}</Text>
            {error && <Text className="text-sm mt-1.5" style={{ color: colors.textMuted }}>Check your connection and try again</Text>}
          </View>
        ) : (
          <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
            {/* Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: H_PAD }}>
              {pageGames.map((game: IGDBGame) => (
                <GameCard key={game.id} game={game} width={itemW} />
              ))}
            </View>

            {/* Pagination */}
            {totalPages > 1 && (
              <View className="flex-row items-center justify-center gap-4 mt-4 px-5">
                <TouchableOpacity
                  disabled={currentPage <= 1}
                  onPress={() => goToPage(currentPage - 1)}
                  className="w-11 h-11 rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: currentPage <= 1 ? 0.4 : 1 }}
                >
                  <CaretLeft size={18} color={colors.text} weight="bold" />
                </TouchableOpacity>

                <Text className="font-semibold" style={{ color: colors.textDim }}>
                  Page <Text style={{ color: accent }}>{currentPage}</Text> of {totalPages}
                </Text>

                <TouchableOpacity
                  disabled={currentPage >= totalPages}
                  onPress={() => goToPage(currentPage + 1)}
                  className="w-11 h-11 rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: currentPage >= totalPages ? 0.4 : 1 }}
                >
                  <CaretRight size={18} color={colors.text} weight="bold" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
