import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlass, TrendUp, Fire, X } from 'phosphor-react-native';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { igdbService } from '@/services/igdbService';
import { useFeaturedGames, useTrendingGames, useRecentlyReleasedGames } from '@/hooks/useGames';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  // Use React Query hooks for data fetching
  const { data: featuredGames = [], isLoading: loadingFeatured } = useFeaturedGames();
  const { data: trendingGames = [], isLoading: loadingTrending } = useTrendingGames();
  const { data: newReleases = [], isLoading: loadingNewReleases } = useRecentlyReleasedGames();

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length === 0) {
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }
      if (debouncedQuery.trim().length < 2) {
        return;
      }
      setIsSearching(true);
      setHasSearched(true);
      try {
        console.log('🔍 Searching for:', debouncedQuery);
        const results = await igdbService.searchGames(debouncedQuery, 10);
        console.log('📝 Search results received:', results.length, 'games');
        console.log('🎮 First result:', results[0]);
        setSearchResults(results);
      } catch (error) {
        console.error('❌ Search error:', error);
        showConfirmation(
          'Error',
          'Failed to search games. Please try again.',
          () => {},
          'warning',
          'OK',
          ''
        );
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
        <View className="flex-1 justify-center items-center px-5">
          <View className="items-center">
            <ActivityIndicator size="large" color="#00D2FF" />
            <Text className="text-[#00D2FF] text-lg font-medium mt-4">Searching games...</Text>
          </View>
        </View>
      );
    }
    
    if (searchResults.length === 0 && searchQuery.trim().length > 0) {
      return (
        <View className="flex-1 justify-center items-center px-5">
          <View className="items-center">
            <Text className="text-white text-xl font-bold mb-2">No games found</Text>
            <Text className="text-gray-400 text-base text-center">Try searching with different keywords</Text>
          </View>
        </View>
      );
    }
    
    if (searchResults.length > 0) {
      return (
        <View className="flex-1 px-5">
          <View className="mb-4">
            <Text className="text-white text-xl font-bold">
              Search Results ({searchResults.length})
            </Text>
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
            <View className="flex-row items-center bg-[#1A2238] rounded-xl px-4 py-3 mb-6 border border-[#374151]">
              <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
              <TextInput
                className="flex-1 ml-3 text-white font-normal text-base"
                placeholder="Search games..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} className="ml-2">
                  <X size={16} color="#94A3B8" weight="bold" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {renderSearchResults()}

            {/* Featured Section */}
            {!hasSearched && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <Text className="text-white text-xl font-bold ml-1">Featured</Text>
                </View>
                {loadingFeatured ? (
                  <ActivityIndicator size="small" color="#00D2FF" />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5">
                    {featuredGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Trending Section */}
            {!hasSearched && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <TrendUp size={24} color="#00D2FF" weight="bold" />
                  <Text className="text-white text-xl font-bold ml-3">Trending Now</Text>
                </View>
                {loadingTrending ? (
                  <ActivityIndicator size="small" color="#00D2FF" />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5">
                    {trendingGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* New Releases */}
            {!hasSearched && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <Fire size={24} color="#FF6B6B" weight="bold" />
                  <Text className="text-white text-xl font-bold ml-3">New Releases</Text>
                </View>
                {loadingNewReleases ? (
                  <ActivityIndicator size="small" color="#FF6B6B" />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5">
                    {newReleases.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </ScrollView>
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