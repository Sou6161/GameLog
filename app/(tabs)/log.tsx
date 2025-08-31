import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlass, X, Check, Star, Heart, Calendar, Tag, ArrowLeft, Plus } from 'phosphor-react-native';
import { GameCard } from '@/components/GameCard';
import { useLocalSearchParams, router } from 'expo-router';

// Mock API function for game search
const searchGamesAPI = async (query: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
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

  return mockGames.filter(game => 
    game.title.toLowerCase().includes(query.toLowerCase()) ||
    game.genre.toLowerCase().includes(query.toLowerCase())
  );
};

export default function LogScreen() {
  const params = useLocalSearchParams();
  
  // Game Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Review Writing State
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [watchDate, setWatchDate] = useState('Sunday 31 August, 2025');

  // Check if a game was passed via navigation params
  useEffect(() => {
    if (params.game) {
      try {
        const gameData = JSON.parse(params.game as string);
        setSelectedGame(gameData);
        setShowReviewPage(true);
      } catch (error) {
        console.error('Error parsing game data:', error);
      }
    }
  }, [params.game]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      if (debouncedQuery.trim().length < 2) return;

      setIsSearching(true);
      try {
        const results = await searchGamesAPI(debouncedQuery);
        setSearchResults(results);
      } catch (error) {
        Alert.alert('Error', 'Failed to search games');
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    setShowReviewPage(true);
  };

  const handleBackToSearch = () => {
    setShowReviewPage(false);
    setSelectedGame(null);
    setRating(0);
    setLiked(false);
    setReview('');
    setSelectedTags([]);
    
    // If we came from library, go back to the previous screen
    if (params.game) {
      router.back();
    }
  };

  const handleSaveReview = () => {
    // Here you would save the review to your backend
    Alert.alert('Success', 'Review saved successfully!');
    handleBackToSearch();
  };

  const handleAddToLibrary = () => {
    // Here you would add the game to the user's library
    Alert.alert('Success', 'Game added to library!');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const renderGameSelection = () => (
    <View style={styles.content}>
      <Text style={styles.title}>I Played</Text>
      <Text style={styles.subtitle}>What game did you play?</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a game..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Search Results */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D2FF" />
          <Text style={styles.loadingText}>Searching games...</Text>
        </View>
      )}

      {searchResults.length > 0 && !isSearching && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Search Results</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {searchResults.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameResultItem}
                onPress={() => handleGameSelect(game)}
              >
                <Image source={{ uri: game.coverUrl }} style={styles.gameCover} />
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameGenre}>{game.genre}</Text>
                  <View style={styles.gameRating}>
                    <Star size={16} color="#FFD700" weight="fill" />
                    <Text style={styles.ratingText}>{game.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderReviewPage = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <TouchableOpacity onPress={handleBackToSearch} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.reviewTitle}>I Played</Text>
        <TouchableOpacity onPress={handleSaveReview} style={styles.saveButton}>
          <Check size={24} color="#00D2FF" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Game Info */}
      <View style={styles.gameInfoContainer}>
        <Image source={{ uri: selectedGame?.coverUrl }} style={styles.selectedGameCover} />
        <Text style={styles.selectedGameTitle}>{selectedGame?.title}</Text>
        <TouchableOpacity 
          style={styles.addToLibraryButton}
          onPress={handleAddToLibrary}
        >
          <LinearGradient
            colors={['#00D2FF', '#6c5ce7']}
            style={styles.addToLibraryGradient}
          >
            <Plus size={16} color="#FFFFFF" weight="bold" />
            <Text style={styles.addToLibraryText}>Add to Library</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Date Selection */}
      <View style={styles.inputRow}>
        <View style={styles.inputLabel}>
          <Calendar size={20} color="#94A3B8" weight="bold" />
          <Text style={styles.labelText}>Date</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{watchDate}</Text>
          <TouchableOpacity style={styles.clearButton}>
            <X size={16} color="#94A3B8" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.inputRow}>
        <View style={styles.inputLabel}>
          <Star size={20} color="#94A3B8" weight="bold" />
          <Text style={styles.labelText}>Rate</Text>
        </View>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Star 
                size={24} 
                color={star <= rating ? "#FFD700" : "#374151"} 
                weight={star <= rating ? "fill" : "regular"} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Like */}
      <View style={styles.inputRow}>
        <View style={styles.inputLabel}>
          <Heart size={20} color="#94A3B8" weight="bold" />
          <Text style={styles.labelText}>Like</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setLiked(!liked)}
          style={styles.likeButton}
        >
          <Heart 
            size={24} 
            color={liked ? "#FF6B6B" : "#374151"} 
            weight={liked ? "fill" : "regular"} 
          />
          <Text style={[styles.likeText, { color: liked ? "#FF6B6B" : "#94A3B8" }]}>
            Like
          </Text>
        </TouchableOpacity>
      </View>

      {/* Review */}
      <View style={styles.reviewContainer}>
        <Text style={styles.labelText}>Add review...</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Share your thoughts about this game..."
          placeholderTextColor="#94A3B8"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        <Text style={styles.labelText}>Add tags...</Text>
        <View style={styles.tagsGrid}>
          {[
            { id: 'first-time', label: 'First-time play', icon: '🎮' },
            { id: 'no-spoilers', label: 'No spoilers', icon: '🤐' },
            { id: 'masterpiece', label: 'Masterpiece', icon: '👑' },
            { id: 'underrated', label: 'Underrated', icon: '💎' },
            { id: 'replay', label: 'Replay', icon: '🔄' },
            { id: 'coop', label: 'Co-op', icon: '👥' },
          ].map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagButton,
                selectedTags.includes(tag.id) && styles.tagButtonSelected
              ]}
              onPress={() => toggleTag(tag.id)}
            >
              <Text style={styles.tagIcon}>{tag.icon}</Text>
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag.id) && styles.tagTextSelected
              ]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

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
          {showReviewPage ? renderReviewPage() : renderGameSelection()}
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
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
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
  resultsContainer: {
    marginTop: 16,
  },
  resultsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  gameResultItem: {
    flexDirection: 'row',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  gameCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  gameTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameGenre: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  gameRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 4,
  },
  // Review Page Styles
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  reviewTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  saveButton: {
    padding: 8,
  },
  gameInfoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  selectedGameCover: {
    width: 80,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedGameTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#E2E8F0',
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#E2E8F0',
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
    marginLeft: 4,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  reviewContainer: {
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2238',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tagButtonSelected: {
    backgroundColor: '#00D2FF',
    borderColor: '#00D2FF',
  },
  tagIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  tagTextSelected: {
    color: '#000000',
    fontFamily: 'Inter_500Medium',
  },
  addToLibraryButton: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addToLibraryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addToLibraryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
});