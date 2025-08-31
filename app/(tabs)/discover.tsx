import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlass, TrendUp, Fire, X } from 'phosphor-react-native';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';

// Mock API function - replace with your actual API call
const searchGamesAPI = async (query: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data - replace with actual API response
  const mockGames = [
    {
      id: '1',
      title: 'Cyberpunk 2077',
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
      rating: 8.5,
      genre: 'RPG',
    },
    {
      id: '2',
      title: 'Elden Ring',
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
      rating: 9.2,
      genre: 'Action RPG',
    },
    {
      id: '3',
      title: 'God of War Ragnarök',
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
      rating: 9.4,
      genre: 'Action Adventure',
    },
    {
      id: '4',
      title: 'The Witcher 3',
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
      rating: 9.0,
      genre: 'RPG',
    },
    {
      id: '5',
      title: 'Baldur\'s Gate 3',
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
      rating: 9.6,
      genre: 'RPG',
    },
  ];

  // Filter games based on search query
  return mockGames.filter(game => 
    game.title.toLowerCase().includes(query.toLowerCase()) ||
    game.genre.toLowerCase().includes(query.toLowerCase())
  );
};

const mockTrendingGames = [
  {
    id: '1',
    title: 'Baldur\'s Gate 3',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 9.6,
    genre: 'RPG',
  },
  {
    id: '2',
    title: 'Spider-Man 2',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 8.8,
    genre: 'Action',
  },
  {
    id: '3',
    title: 'Alan Wake 2',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 9.1,
    genre: 'Horror',
  },
];

const mockNewReleases = [
  {
    id: '4',
    title: 'Starfield',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 7.5,
    genre: 'RPG',
  },
  {
    id: '5',
    title: 'Mortal Kombat 1',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 8.2,
    genre: 'Fighting',
  },
  {
    id: '6',
    title: 'Assassin\'s Creed Mirage',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 7.8,
    genre: 'Action Adventure',
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms delay

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
        return; // Don't search for queries less than 2 characters
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const results = await searchGamesAPI(debouncedQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        Alert.alert('Error', 'Failed to search games. Please try again.');
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
        <View style={styles.searchResultsContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D2FF" />
            <Text style={styles.loadingText}>Searching games...</Text>
          </View>
        </View>
      );
    }

    if (searchResults.length === 0 && searchQuery.trim().length > 0) {
      return (
        <View style={styles.searchResultsContainer}>
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No games found</Text>
            <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
          </View>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <View style={styles.searchResultsContainer}>
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsTitle}>
              Search Results ({searchResults.length})
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
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
    <LinearGradient
      colors={['#6c5ce7','black','#6c5ce7']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search games..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <X size={16} color="#94A3B8" weight="bold" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {renderSearchResults()}

            {/* Trending Section - Only show when not searching */}
            {!hasSearched && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <TrendUp size={24} color="#00D2FF" weight="bold" />
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                </View>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {mockTrendingGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* New Releases - Only show when not searching */}
            {!hasSearched && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Fire size={24} color="#FF6B6B" weight="bold" />
                  <Text style={styles.sectionTitle}>New Releases</Text>
                </View>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {mockNewReleases.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchResultsContainer: {
    marginBottom: 24,
  },
  searchResultsHeader: {
    marginBottom: 16,
  },
  searchResultsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  horizontalScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
});