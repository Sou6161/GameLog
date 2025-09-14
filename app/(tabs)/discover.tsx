import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MagnifyingGlass, 
  TrendUp, 
  Fire, 
  X, 
  Trophy, 
  Car, 
  GameController, 
  Sword, 
  Crown,
  Ghost,
  Clock
} from 'phosphor-react-native';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { 
  useTrendingGames, 
  useRecentlyReleasedGames,
  useTopRatedGames,
  useRacingGames,
  useSportsGames,
  useFightingGames,
  useStrategyGames,
  useHorrorGames,
  useMostAnticipatedGames
} from '@/hooks/useGames';
import { igdbService } from '@/services/igdbService';

// Transform IGDB game to GameCard format
const transformIGDBGame = (game: any) => ({
  id: game.id,
  name: game.name || 'Unknown Game',
  cover: game.cover ? { 
    id: game.cover.id, 
    url: game.cover.url 
  } : undefined,
  rating: game.rating || 0,
  genres: game.genres || [],
  first_release_date: game.first_release_date,
  platforms: game.platforms || [],
  summary: game.summary || '',
});

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch data using hooks
  const { data: trendingGames, isLoading: loadingTrending } = useTrendingGames();
  const { data: newReleases, isLoading: loadingNewReleases } = useRecentlyReleasedGames();
  const { data: topRatedGames, isLoading: loadingTopRated } = useTopRatedGames();
  const { data: racingGames, isLoading: loadingRacing } = useRacingGames();
  const { data: sportsGames, isLoading: loadingSports } = useSportsGames();
  const { data: fightingGames, isLoading: loadingFighting } = useFightingGames();
  const { data: strategyGames, isLoading: loadingStrategy } = useStrategyGames();
  const { data: horrorGames, isLoading: loadingHorror } = useHorrorGames();
  const { data: anticipatedGames, isLoading: loadingAnticipated } = useMostAnticipatedGames();

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 600); // 600ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      // Reset previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear results if query is too short
      if (debouncedQuery.length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
        setSearchError(null);
        return;
      }

      // Start searching
      setIsSearching(true);
      setHasSearched(true);
      setSearchError(null);
      abortControllerRef.current = new AbortController();

      try {
        const games = await igdbService.searchGames(debouncedQuery, 15);
        
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setSearchResults(games || []);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          setSearchError('Failed to search games. Please try again.');
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearSearch = useCallback(() => {
    // Clear timeouts and abort any ongoing requests
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset all search states
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
    setSearchError(null);
  }, []);

  const renderGameSection = (title: string, games: any[] | undefined, isLoading: boolean, icon: React.ReactNode, color: string) => {
    if (hasSearched) return null;
    
    return (
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          {icon}
          <Text className="text-white text-xl font-bold ml-3">{title}</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5">
            {games?.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!hasSearched && !isSearching) return null;
    
    // Show loading state
    if (isSearching) {
      return (
        <View className="flex-1 justify-center items-center px-5 py-12">
          <View className="items-center">
            <ActivityIndicator size="large" color="#00D2FF" />
            <Text className="text-[#00D2FF] text-lg font-medium mt-4">Searching games...</Text>
            <Text className="text-gray-400 text-sm mt-2">Looking for "{debouncedQuery}"</Text>
          </View>
        </View>
      );
    }
    
    // Show error state
    if (searchError) {
      return (
        <View className="flex-1 justify-center items-center px-5 py-12">
          <View className="items-center">
            <Text className="text-red-400 text-xl font-bold mb-2">Search Error</Text>
            <Text className="text-gray-400 text-base text-center mb-4">{searchError}</Text>
            <TouchableOpacity 
              onPress={() => setDebouncedQuery(debouncedQuery)} 
              className="bg-[#00D2FF] px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // Show no results state
    if (searchResults.length === 0 && debouncedQuery.length > 0) {
      return (
        <View className="flex-1 justify-center items-center px-5 py-12">
          <View className="items-center">
            <Text className="text-white text-xl font-bold mb-2">No games found</Text>
            <Text className="text-gray-400 text-base text-center mb-2">No results for "{debouncedQuery}"</Text>
            <Text className="text-gray-500 text-sm text-center">Try different keywords or check spelling</Text>
          </View>
        </View>
      );
    }
    
    // Show search results
    if (searchResults.length > 0) {
      return (
        <View className="flex-1 px-5 mb-8">
          <View className="mb-4">
            <Text className="text-white text-xl font-bold">
              Search Results ({searchResults.length})
            </Text>
            <Text className="text-gray-400 text-sm mt-1">Results for "{debouncedQuery}"</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="-mx-5"
          >
            {searchResults.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </ScrollView>
        </View>
      );
    }
    
    return null;
  };

  return (
    <LinearGradient colors={["#0F0F1F", "#121631", "#0A2342"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pb-8">
            {/* Search Bar */}
            <View className={`flex-row items-center bg-[#1A2238] rounded-xl px-4 py-3 mb-6 border ${
              isSearching ? 'border-[#00D2FF]' : 'border-[#374151]'
            }`}>
              {isSearching ? (
                <ActivityIndicator size={20} color="#00D2FF" />
              ) : (
                <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
              )}
              <TextInput
                className="flex-1 ml-3 text-white font-normal text-base"
                placeholder="Search games..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                editable={!isSearching}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} className="ml-2">
                  <X size={16} color="#94A3B8" weight="bold" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {renderSearchResults()}

            {/* Game Sections */}
            {renderGameSection(
              "Trending Now", 
              trendingGames, 
              loadingTrending, 
              <TrendUp size={24} color="#00D2FF" weight="bold" />, 
              "#00D2FF"
            )}

            {renderGameSection(
              "New Releases", 
              newReleases, 
              loadingNewReleases, 
              <Fire size={24} color="#FF6B6B" weight="bold" />, 
              "#FF6B6B"
            )}

            {renderGameSection(
              "Top Rated", 
              topRatedGames, 
              loadingTopRated, 
              <Trophy size={24} color="#FFD700" weight="bold" />, 
              "#FFD700"
            )}

            {renderGameSection(
              "Racing Games", 
              racingGames, 
              loadingRacing, 
              <Car size={24} color="#FF4757" weight="bold" />, 
              "#FF4757"
            )}

            {renderGameSection(
              "Sports Games", 
              sportsGames, 
              loadingSports, 
              <GameController size={24} color="#2ED573" weight="bold" />, 
              "#2ED573"
            )}

            {renderGameSection(
              "Fighting Games", 
              fightingGames, 
              loadingFighting, 
              <Sword size={24} color="#FF3838" weight="bold" />, 
              "#FF3838"
            )}

            {renderGameSection(
              "Strategy Games", 
              strategyGames, 
              loadingStrategy, 
              <Crown size={24} color="#A55EEA" weight="bold" />, 
              "#A55EEA"
            )}

            {renderGameSection(
              "Horror Games", 
              horrorGames, 
              loadingHorror, 
              <Ghost size={24} color="#2C2C54" weight="bold" />, 
              "#2C2C54"
            )}

            {renderGameSection(
              "Most Anticipated", 
              anticipatedGames, 
              loadingAnticipated, 
              <Clock size={24} color="#FF9F43" weight="bold" />, 
              "#FF9F43"
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}