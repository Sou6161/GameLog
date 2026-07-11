import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MagnifyingGlass, TrendUp, Fire, X, Sparkle, Compass, Star, CaretRight, GameController } from 'phosphor-react-native';
import { router } from 'expo-router';
import { GameCard } from '@/components/GameCard';
import { igdbService } from '@/services/igdbService';
import { useFeaturedGames, useTrendingGames, useRecentlyReleasedGames } from '@/hooks/useGames';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';
import { colors, gradients, accents, glow, alpha } from '@/constants/theme';

function SectionTitle({ title, icon: Icon, color }: { title: string; icon: any; color: string }) {
  return (
    <View className="flex-row items-center gap-3 mb-4">
      <View style={{ width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: color, ...glow(color, 0.4, 10) }}>
        <Icon size={18} color={colors.void} weight="fill" />
      </View>
      <View>
        <Text className="font-bold text-[19px]" style={{ color: colors.text }}>{title}</Text>
        <View className="h-[3px] w-10 mt-1 rounded-full" style={{ backgroundColor: color }} />
      </View>
    </View>
  );
}

// Full-width vertical search result row.
function ResultRow({ game }: { game: any }) {
  const rating = game.rating ? (game.rating / 10).toFixed(1) : null;
  const genre = game.genres && game.genres.length > 0 ? game.genres[0].name : null;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/game/[id]', params: { id: String(game.id) } })}
      className="flex-row items-center rounded-[18px] p-3 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      {game.cover?.url ? (
        <Image source={{ uri: game.cover.url }} className="w-14 h-20 rounded-xl" />
      ) : (
        <View className="w-14 h-20 rounded-xl items-center justify-center" style={{ backgroundColor: colors.elevated }}>
          <GameController size={22} color={colors.textMuted} />
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text className="font-bold text-base" style={{ color: colors.text }} numberOfLines={2}>{game.name}</Text>
        {genre && <Text className="text-[13px] mt-1" style={{ color: colors.teal }}>{genre}</Text>}
        {rating && (
          <View className="flex-row items-center mt-1.5 self-start px-2 py-0.5 rounded-full" style={{ backgroundColor: alpha(colors.gold, 0.14) }}>
            <Star size={12} color={colors.gold} weight="fill" />
            <Text className="font-bold text-xs ml-1" style={{ color: colors.gold }}>{rating}</Text>
          </View>
        )}
      </View>
      <CaretRight size={18} color={colors.textMuted} weight="bold" />
    </TouchableOpacity>
  );
}

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  const { data: featuredGames = [], isLoading: loadingFeatured } = useFeaturedGames();
  const { data: trendingGames = [], isLoading: loadingTrending } = useTrendingGames();
  const { data: newReleases = [], isLoading: loadingNewReleases } = useRecentlyReleasedGames();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length === 0) {
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }
      if (debouncedQuery.trim().length < 2) return;
      setIsSearching(true);
      setHasSearched(true);
      try {
        const results = await igdbService.searchGames(debouncedQuery, 20);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        showConfirmation('Error', 'Failed to search games. Please try again.', () => {}, 'warning', 'OK', '');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  }, []);

  const renderSearchResults = () => {
    if (!hasSearched) return null;

    if (isSearching) {
      return (
        <View className="py-16 justify-center items-center">
          <ActivityIndicator size="large" color={colors.teal} />
          <Text className="text-base font-medium mt-4" style={{ color: colors.tealBright }}>Searching games...</Text>
        </View>
      );
    }

    if (searchResults.length === 0 && searchQuery.trim().length > 0) {
      return (
        <View className="py-16 justify-center items-center px-5">
          <View className="w-16 h-16 rounded-full justify-center items-center mb-4" style={{ backgroundColor: alpha(colors.teal, 0.14) }}>
            <MagnifyingGlass size={28} color={colors.tealBright} weight="bold" />
          </View>
          <Text className="text-xl font-bold mb-1.5" style={{ color: colors.text }}>No games found</Text>
          <Text className="text-base text-center" style={{ color: colors.textMuted }}>Try searching with different keywords</Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      // Vertical, top-to-bottom list of results
      return (
        <View className="mb-2">
          <SectionTitle title={`Results (${searchResults.length})`} icon={MagnifyingGlass} color={accents.top.color} />
          {searchResults.map((game) => <ResultRow key={game.id} game={game} />)}
        </View>
      );
    }
    return null;
  };

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 120 : 110 }}>
          <View className="px-5 pt-2 pb-8">
            {/* Title */}
            <View className="flex-row items-center gap-3 mb-5">
              <View style={{ width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cyan, ...glow(colors.cyan, 0.4, 10) }}>
                <Compass size={22} color={colors.void} weight="fill" />
              </View>
              <View>
                <Text className="font-bold text-[26px]" style={{ color: colors.text }}>Discover</Text>
                <Text className="font-normal text-[13px]" style={{ color: colors.textMuted }}>Find your next favorite game</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View
              className="flex-row items-center rounded-2xl px-4 py-3.5 mb-7"
              style={{ backgroundColor: colors.surface, borderWidth: 1.5, borderColor: focused ? colors.teal : colors.border }}
            >
              <MagnifyingGlass size={20} color={focused ? colors.tealBright : colors.textMuted} weight="bold" />
              <TextInput
                className="flex-1 ml-3 font-normal text-base"
                style={{ color: colors.text }}
                placeholder="Search games..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} className="ml-2 w-6 h-6 rounded-full justify-center items-center" style={{ backgroundColor: alpha(colors.text, 0.1) }}>
                  <X size={14} color={colors.textDim} weight="bold" />
                </TouchableOpacity>
              )}
            </View>

            {renderSearchResults()}

            {!hasSearched && (
              <>
                <View className="mb-8">
                  <SectionTitle title="Featured" icon={Sparkle} color={accents.featured.color} />
                  {loadingFeatured ? (
                    <ActivityIndicator size="large" color={accents.featured.color} className="py-10" />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                      {featuredGames.map((game) => <GameCard key={game.id} game={game} />)}
                    </ScrollView>
                  )}
                </View>

                <View className="mb-8">
                  <SectionTitle title="Trending Now" icon={TrendUp} color={accents.trending.color} />
                  {loadingTrending ? (
                    <ActivityIndicator size="large" color={accents.trending.color} className="py-10" />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                      {trendingGames.map((game) => <GameCard key={game.id} game={game} />)}
                    </ScrollView>
                  )}
                </View>

                <View className="mb-4">
                  <SectionTitle title="New Releases" icon={Fire} color={accents.anticipated.color} />
                  {loadingNewReleases ? (
                    <ActivityIndicator size="large" color={accents.anticipated.color} className="py-10" />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                      {newReleases.map((game) => <GameCard key={game.id} game={game} />)}
                    </ScrollView>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

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
