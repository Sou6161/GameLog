import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlass, X, Check, Star, Heart, Calendar, ArrowLeft, Plus, GameController } from 'phosphor-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { igdbService } from '@/services/igdbService';

interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
  genres?: Array<{ name: string }>;
  rating?: number;
}

interface GameReview {
  id: string;
  game: IGDBGame;
  status: string;
  rating: number;
  reviewText: string;
  playTime: string;
  difficulty: string;
  platform: string;
  tags: string[];
  isPublic: boolean;
  date: string;
}

export default function LogScreen() {
  const params = useLocalSearchParams();
  
  // Search and Game Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IGDBGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<IGDBGame | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Review Form State
  const [gameStatus, setGameStatus] = useState('completed');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [playTime, setPlayTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [platform, setPlatform] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  
  // Reviews Storage
  const [myReviews, setMyReviews] = useState<GameReview[]>([]);

  // Current date for review
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Game status options
  const gameStatusOptions = [
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'playing', label: 'Currently Playing', icon: '🎮' },
    { id: 'dropped', label: 'Dropped', icon: '❌' },
    { id: 'plan', label: 'Plan to Play', icon: '📅' }
  ];

  // Available tags for reviews
  const availableTags = [
    'Masterpiece', 'Great Story', 'Amazing Graphics', 'Excellent Gameplay',
    'Challenging', 'Relaxing', 'Multiplayer Fun', 'Single Player',
    'Replay Value', 'Emotional', 'Creative', 'Innovative',
    'Nostalgic', 'Atmospheric', 'Fast Paced', 'Slow Burn'
  ];

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 600);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle search API calls
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const results = await igdbService.searchGames(query);
      if (!abortController.signal.aborted) {
        setSearchResults(results);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  // Handle search change with debouncing
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      handleSearch(debouncedQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  // Game selection for review
  const handleGameSelect = (game: IGDBGame) => {
    setSelectedGame(game);
    setShowReviewForm(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Rating helper
  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  // Tag toggle
  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Submit review
  const handleSubmitReview = () => {
    if (!selectedGame) return;
    
    const newReview: GameReview = {
      id: Date.now().toString(),
      game: selectedGame,
      status: gameStatus,
      rating,
      reviewText,
      playTime,
      difficulty,
      platform,
      tags,
      isPublic,
      date: currentDate
    };
    
    setMyReviews(prev => [newReview, ...prev]);
    
    Alert.alert('Success', 'Review posted successfully!');
    
    // Reset form
    setShowReviewForm(false);
    setSelectedGame(null);
    setRating(0);
    setReviewText('');
    setPlayTime('');
    setDifficulty('');
    setPlatform('');
    setTags([]);
    setGameStatus('completed');
  };

  // Rating description
  const getRatingDescription = (rating: number) => {
    if (rating === 0) return 'Rate this game';
    if (rating <= 2) return 'Poor';
    if (rating <= 4) return 'Fair';
    if (rating <= 6) return 'Good';
    if (rating <= 8) return 'Great';
    return 'Masterpiece';
  };

  // Helper functions for review display
  const getStatusIcon = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'completed': '✅',
      'playing': '🎮',
      'dropped': '❌',
      'plan': '📅'
    };
    return statusMap[status] || '✅';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'completed': 'Completed',
      'playing': 'Currently Playing',
      'dropped': 'Dropped',
      'plan': 'Plan to Play'
    };
    return statusMap[status] || 'Completed';
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'completed': 'text-green-400',
      'playing': 'text-blue-400',
      'dropped': 'text-red-400',
      'plan': 'text-yellow-400'
    };
    return colorMap[status] || 'text-green-400';
  };

  // Review form view
  if (showReviewForm && selectedGame) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <ScrollView className="flex-1 px-4 py-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={() => setShowReviewForm(false)}
              className="mr-4"
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Write Review</Text>
          </View>

          {/* Game Info */}
          <View className="bg-gray-800 rounded-lg p-4 mb-6">
            <View className="flex-row items-center">
              {selectedGame.cover?.url ? (
                <Image 
                  source={{ uri: selectedGame.cover.url.replace('t_thumb', 't_cover_big') }}
                  className="w-20 h-28 rounded mr-4"
                />
              ) : (
                <View className="w-20 h-28 bg-gray-700 rounded mr-4 items-center justify-center">
                  <GameController size={24} color="#9CA3AF" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">{selectedGame.name}</Text>
                {selectedGame.first_release_date && (
                  <Text className="text-gray-400 mb-2">
                    {new Date(selectedGame.first_release_date * 1000).getFullYear()}
                  </Text>
                )}
                <Text className="text-green-400 font-semibold">{currentDate}</Text>
              </View>
            </View>
          </View>

          {/* Game Status */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Game Status</Text>
            <View className="flex-row flex-wrap">
              {gameStatusOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setGameStatus(option.id)}
                  className={`mr-3 mb-2 px-4 py-2 rounded-lg flex-row items-center ${
                    gameStatus === option.id ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <Text className="mr-2">{option.icon}</Text>
                  <Text className="text-white font-medium">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Rating</Text>
            <View className="bg-gray-800 rounded-lg p-4">
              <View className="flex-row items-center justify-center mb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleRatingPress(star)}>
                    <Star 
                      size={28} 
                      color={star <= rating ? '#F59E0B' : '#374151'} 
                      weight={star <= rating ? 'fill' : 'regular'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-center text-yellow-400 font-semibold text-lg">
                {rating > 0 ? `${rating}/10 - ${getRatingDescription(rating)}` : getRatingDescription(rating)}
              </Text>
            </View>
          </View>

          {/* Play Details */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Play Details</Text>
            <View className="space-y-3">
              <View>
                <Text className="text-gray-400 mb-1">Play Time</Text>
                <TextInput
                  value={playTime}
                  onChangeText={setPlayTime}
                  placeholder="e.g., 25 hours"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                />
              </View>
              <View>
                <Text className="text-gray-400 mb-1">Platform</Text>
                <TextInput
                  value={platform}
                  onChangeText={setPlatform}
                  placeholder="e.g., PC, PlayStation 5, Xbox"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                />
              </View>
              <View>
                <Text className="text-gray-400 mb-1">Difficulty</Text>
                <TextInput
                  value={difficulty}
                  onChangeText={setDifficulty}
                  placeholder="e.g., Normal, Hard, Easy"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                />
              </View>
            </View>
          </View>

          {/* Review Text */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Your Review</Text>
            <View className="bg-gray-800 rounded-lg p-4">
              <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Share your thoughts about this game..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="text-white text-base leading-6"
              />
              <Text className="text-gray-500 text-sm mt-2 text-right">
                {reviewText.length}/500 characters
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Tags</Text>
            <View className="flex-row flex-wrap">
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagToggle(tag)}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg ${
                    tags.includes(tag) ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    tags.includes(tag) ? 'text-white' : 'text-gray-300'
                  }`}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy Toggle */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between bg-gray-800 rounded-lg p-4">
              <View>
                <Text className="text-white font-semibold">Public Review</Text>
                <Text className="text-gray-400 text-sm">Share with the community</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full ${isPublic ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                <View className={`w-5 h-5 bg-white rounded-full mt-0.5 ${
                  isPublic ? 'ml-6' : 'ml-0.5'
                }`} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmitReview}
            className="bg-green-600 rounded-lg p-4 mb-6"
          >
            <Text className="text-white text-center font-bold text-lg">Post Review</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main search and reviews view
  return (
    <LinearGradient
      colors={['#0F0F1F', '#121631', '#0A2342']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-4 py-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-white mb-2">Game Reviews</Text>
            <Text className="text-gray-400">Share your gaming experiences</Text>
          </View>

          {/* Search Bar */}
          <View className="mb-6">
            <View className="relative">
              <TextInput
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Search for games to review..."
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg pr-10"
              />
              <View className="absolute right-3 top-3">
                {isSearching ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : (
                  <MagnifyingGlass size={20} color="#9CA3AF" />
                )}
              </View>
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View className="mt-2 bg-gray-800 rounded-lg max-h-60">
                <ScrollView>
                  {searchResults.map((game) => (
                    <TouchableOpacity 
                      key={game.id} 
                      className="p-3 border-b border-gray-700 last:border-b-0"
                      onPress={() => handleGameSelect(game)}
                    >
                      <View className="flex-row items-center">
                        {game.cover?.url ? (
                          <Image 
                            source={{ uri: game.cover.url.replace('t_thumb', 't_cover_small') }}
                            className="w-10 h-14 rounded mr-3"
                          />
                        ) : (
                          <View className="w-10 h-14 bg-gray-700 rounded mr-3 items-center justify-center">
                            <GameController size={20} color="#9CA3AF" />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-white font-semibold" numberOfLines={1}>
                            {game.name}
                          </Text>
                          {game.first_release_date && (
                            <Text className="text-gray-400 text-sm">
                              {new Date(game.first_release_date * 1000).getFullYear()}
                            </Text>
                          )}
                        </View>
                        <Plus size={20} color="#10B981" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* My Reviews Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">My Reviews</Text>
              <Text className="text-gray-400">{myReviews.length} reviews</Text>
            </View>

            {myReviews.length === 0 ? (
              <View className="bg-gray-800 rounded-lg p-8 items-center">
                <GameController size={48} color="#6B7280" />
                <Text className="text-white text-lg font-semibold mt-4 mb-2">No reviews yet</Text>
                <Text className="text-gray-400 text-center text-sm">
                  Search for a game above to write your first review
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {myReviews.map((review) => (
                  <View key={review.id} className="bg-gray-800 rounded-lg p-4">
                    <View className="flex-row items-center mb-3">
                      {review.game.cover?.url ? (
                        <Image 
                          source={{ uri: review.game.cover.url.replace('t_thumb', 't_cover_small') }}
                          className="w-16 h-24 rounded mr-4"
                        />
                      ) : (
                        <View className="w-16 h-24 bg-gray-700 rounded mr-4 items-center justify-center">
                          <GameController size={24} color="#9CA3AF" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">{review.game.name}</Text>
                        <Text className={`text-sm mb-1 ${getStatusColor(review.status)}`}>
                          {getStatusIcon(review.status)} {getStatusLabel(review.status)}
                        </Text>
                        <Text className="text-gray-400 text-sm mb-2">{review.date}</Text>
                        <View className="flex-row items-center">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <Star 
                              key={star} 
                              size={14} 
                              color={star <= review.rating ? '#F59E0B' : '#374151'} 
                              weight={star <= review.rating ? 'fill' : 'regular'}
                            />
                          ))}
                          <Text className="text-yellow-400 ml-2 font-semibold">{review.rating}/10</Text>
                        </View>
                      </View>
                    </View>
                    {review.reviewText && (
                      <Text className="text-gray-300 text-sm leading-5 mb-3">
                        {review.reviewText}
                      </Text>
                    )}
                    {review.tags.length > 0 && (
                      <View className="flex-row flex-wrap mb-2">
                        {review.tags.map((tag) => (
                          <View key={tag} className="bg-green-600/20 px-2 py-1 rounded mr-2 mb-1">
                            <Text className="text-green-400 text-xs">{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <Text className="text-gray-500 text-xs">
                      {review.platform && `Played on ${review.platform}`}
                      {review.playTime && ` • ${review.playTime}hrs`}
                      {review.difficulty && ` • ${review.difficulty} difficulty`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>


        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}