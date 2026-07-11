import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MagnifyingGlass, X, Check, Star, Heart, Calendar, ArrowLeft, Plus, GameController, PencilSimple } from 'phosphor-react-native';
import { colors, gradients, glow, alpha } from '@/constants/theme';
import { formatReviewDate } from '@/lib/format';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { igdbService } from '@/services/igdbService';
import { useAchievements } from '@/hooks/useAchievements';
import { useGameStore } from '@/store/gameStore';
import { useReviewStore } from '@/store/reviewStore';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const markReviewed = useGameStore((s) => s.markReviewed);
  const createReview = useReviewStore((s) => s.createReview);
  const updateReview = useReviewStore((s) => s.updateReview);
  const hasUserReviewedGame = useReviewStore((s) => s.hasUserReviewedGame);
  const getUserReviewForGame = useReviewStore((s) => s.getUserReviewForGame);
  const fetchUserReviews = useReviewStore((s) => s.fetchUserReviews);
  const reduxReviews = useReviewStore((s) => s.reviews);
  
  // Achievement tracking
  const { trackReview } = useAchievements();
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
  
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
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<GameReview | null>(null);
  
  // "My Reviews" reads the live store directly so it's always current.
  const myReviews = reduxReviews as any as GameReview[];
  const [isEditMode, setIsEditMode] = useState(false);
  // Tracks which navigation "nonce" we've already acted on, so opening the tab
  // directly (or switching back to it) never re-opens a stale review form.
  const consumedNonceRef = useRef<string | null>(null);

  // Reset back to the search / My Reviews screen.
  const resetReviewFlow = useCallback(() => {
    setShowReviewForm(false);
    setSelectedGame(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setRating(0);
    setReviewText('');
    setPlayTime('');
    setDifficulty('');
    setPlatform('');
    setTags([]);
    setGameStatus('completed');
    setIsPublic(true);
    setHasExistingReview(false);
    setExistingReview(null);
    setIsEditMode(false);
  }, []);

  // Fetch a game by id and open the review form for it.
  const openReviewForGame = useCallback(async (id: number) => {
    try {
      const game = await igdbService.getGameDetails(id);
      if (game) {
        setSelectedGame(game as any);
        setShowReviewForm(true);
      }
    } catch (error) {
      console.error('Failed to load game for review:', error);
    }
  }, []);

  // Decide what to show whenever the tab gains focus:
  //  - fresh navigation from a game detail (unique `ts` nonce) -> open review form
  //  - opened directly / switched back -> show the search + My Reviews screen
  useFocusEffect(
    useCallback(() => {
      const nonce = (params.ts as string) || '';
      const isFresh = !!nonce && nonce !== consumedNonceRef.current;

      let gameId: number | null = null;
      if (params.gameId) {
        const parsed = parseInt(params.gameId as string, 10);
        if (!isNaN(parsed)) gameId = parsed;
      } else if (params.game) {
        try {
          const g = JSON.parse(params.game as string);
          if (g?.id) gameId = Number(g.id);
        } catch {}
      }

      if (isFresh && gameId) {
        consumedNonceRef.current = nonce;
        setIsEditMode((params.editMode as string) === 'true');
        openReviewForGame(gameId);
      } else {
        resetReviewFlow();
        // Refresh the current user's reviews so "My Reviews" is always populated,
        // even if another screen overwrote the shared reviews list.
        if (user?.id) fetchUserReviews(user.id);
      }
    }, [params.ts, user?.id])
  );

  // Check if user has already reviewed the selected game
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!selectedGame || !user?.id) {
        setHasExistingReview(false);
        setExistingReview(null);
        return;
      }

      try {
        const hasReviewed = await hasUserReviewedGame(user.id, selectedGame.id.toString());
        if (hasReviewed) {
          const userReview = await getUserReviewForGame(user.id, selectedGame.id.toString());
          if (userReview) {
            setHasExistingReview(true);
            setExistingReview(userReview);
            // Pre-fill the form with existing review data
            setGameStatus(userReview.status);
            setRating(userReview.rating);
            setReviewText(userReview.reviewText);
            setPlayTime(userReview.playTime);
            setDifficulty(userReview.difficulty);
            setPlatform(userReview.platform);
            setTags(userReview.tags);
            setIsPublic(userReview.isPublic);
          }
        } else {
          setHasExistingReview(false);
          setExistingReview(null);
        }
      } catch (error) {
        console.error('Error checking existing review:', error);
        setHasExistingReview(false);
        setExistingReview(null);
      }
    };

    checkExistingReview();
  }, [selectedGame, user?.id]);

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
  const handleSubmitReview = async () => {
    if (!selectedGame || !user) {
      showConfirmation(
        'Authentication Required',
        'Please sign in to create a review.',
        () => {},
        'warning',
        'OK',
        ''
      );
      return;
    }
    
    if (!user.id) {
      showConfirmation(
        'Authentication Error',
        'User ID not found. Please sign in again.',
        () => {},
        'warning',
        'OK',
        ''
      );
      return;
    }
    
    console.log('User object:', user);
    console.log('User id:', user.id);
    console.log('User username:', user.username);
    
    try {
      const reviewData = {
        userId: user.id,
        username: user.username || 'Anonymous',
        userAvatar: user.avatar || '',
        game: {
          id: selectedGame.id,
          name: selectedGame.name,
          coverUrl: selectedGame.cover?.url ? selectedGame.cover.url.replace('t_thumb', 't_cover_small') : undefined,
          firstReleaseYear: selectedGame.first_release_date ? new Date(selectedGame.first_release_date * 1000).getFullYear() : undefined,
        },
        status: gameStatus,
        rating,
        reviewText,
        playTime,
        difficulty,
        platform,
        tags,
        isPublic,
        date: new Date().toISOString(),
        verified: true, // User is verified since they're logged in
      };
      
      if (hasExistingReview && existingReview) {
        // Update existing review
        await updateReview(existingReview.id, reviewData);
      } else {
        // Create new review
        await createReview(reviewData);

        // Track achievement for writing a review with genres
        const genres = selectedGame.genres?.map(g => g.name) || [];
        await trackReview(rating, genres);

        // Mark as reviewed globally so game detail shows Edit Review
        markReviewed(String(selectedGame.id));
      }

      // Leave the form and land on the "My Reviews" list right away, then refresh
      // it. We reset BEFORE showing the success modal because the modal is only
      // rendered on the main view (not inside the review-form branch), so it must
      // appear over My Reviews — otherwise the change would happen invisibly.
      const wasEditing = hasExistingReview && existingReview;
      resetReviewFlow();
      if (user.id) fetchUserReviews(user.id);
      showConfirmation(
        'Success',
        wasEditing ? 'Review updated successfully!' : 'Review posted successfully!',
        () => {},
        'success',
        'OK',
        ''
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      showConfirmation(
        'Error',
        'Failed to post review. Please try again.',
        () => {},
        'warning',
        'OK',
        ''
      );
    }
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
      'completed': '#34D399',
      'playing': '#38BDF8',
      'dropped': '#EF4444',
      'plan': '#FBBF24',
    };
    return colorMap[status] || '#34D399';
  };

  // Review form view
  if (showReviewForm && selectedGame) {
    return (
      <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <StatusBar style="light" />
        <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
          <ScrollView className="flex-1 px-5 py-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => setShowReviewForm(false)}
                className="w-10 h-10 rounded-full justify-center items-center mr-3"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <ArrowLeft size={20} color={colors.text} weight="bold" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>{isEditMode ? 'Edit Review' : 'Write Review'}</Text>
            </View>

            {/* Game Info */}
            <View className="rounded-[20px] p-4 mb-6" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <View className="flex-row items-center">
                {selectedGame.cover?.url ? (
                  <Image source={{ uri: selectedGame.cover.url.replace('t_thumb', 't_cover_big') }} className="w-20 h-28 rounded-xl mr-4" />
                ) : (
                  <View className="w-20 h-28 rounded-xl mr-4 items-center justify-center" style={{ backgroundColor: colors.elevated }}>
                    <GameController size={24} color={colors.textMuted} />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>{selectedGame.name}</Text>
                  {selectedGame.first_release_date && (
                    <Text className="mb-2" style={{ color: colors.textMuted }}>{new Date(selectedGame.first_release_date * 1000).getFullYear()}</Text>
                  )}
                  <View className="flex-row items-center self-start px-2.5 py-1 rounded-full" style={{ backgroundColor: alpha(colors.cyan, 0.14) }}>
                    <Calendar size={12} color={colors.cyan} weight="fill" />
                    <Text className="font-semibold text-xs ml-1.5" style={{ color: colors.cyan }}>{currentDate}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Existing Review Warning */}
            {hasExistingReview && (
              <View className="rounded-[18px] p-4 mb-6" style={{ backgroundColor: alpha(colors.gold, 0.12), borderWidth: 1, borderColor: alpha(colors.gold, 0.35) }}>
                <View className="flex-row items-center mb-1.5">
                  <PencilSimple size={16} color={colors.gold} weight="fill" />
                  <Text className="font-bold text-base ml-2" style={{ color: colors.gold }}>You've already reviewed this game</Text>
                </View>
                <Text className="text-sm" style={{ color: alpha(colors.gold, 0.85) }}>You can update your existing review below. Changes will replace your previous review.</Text>
              </View>
            )}

            {/* Game Status */}
            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Game Status</Text>
              <View className="flex-row flex-wrap gap-2.5">
                {gameStatusOptions.map((option) => {
                  const active = gameStatus === option.id;
                  return (
                    <TouchableOpacity key={option.id} onPress={() => setGameStatus(option.id)} activeOpacity={0.85} className="rounded-xl overflow-hidden">
                      {active ? (
                        <View className="px-4 py-2.5 flex-row items-center" style={{ backgroundColor: colors.teal }}>
                          <Text className="mr-2">{option.icon}</Text>
                          <Text className="font-bold" style={{ color: colors.void }}>{option.label}</Text>
                        </View>
                      ) : (
                        <View className="px-4 py-2.5 flex-row items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                          <Text className="mr-2">{option.icon}</Text>
                          <Text className="font-semibold" style={{ color: colors.textDim }}>{option.label}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Rating */}
            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Rating</Text>
              <View className="rounded-[18px] p-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <View className="flex-row items-center justify-center mb-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <TouchableOpacity key={star} onPress={() => handleRatingPress(star)} className="px-0.5">
                      <Star size={26} color={star <= rating ? colors.gold : alpha(colors.text, 0.18)} weight={star <= rating ? 'fill' : 'regular'} />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="text-center font-bold text-lg" style={{ color: colors.gold }}>
                  {rating > 0 ? `${rating}/10 - ${getRatingDescription(rating)}` : getRatingDescription(rating)}
                </Text>
              </View>
            </View>

            {/* Play Details */}
            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Play Details</Text>
              <View className="gap-3">
                {[
                  { label: 'Play Time', value: playTime, setter: setPlayTime, ph: 'e.g., 25 hours' },
                  { label: 'Platform', value: platform, setter: setPlatform, ph: 'e.g., PC, PlayStation 5, Xbox' },
                  { label: 'Difficulty', value: difficulty, setter: setDifficulty, ph: 'e.g., Normal, Hard, Easy' },
                ].map((f) => (
                  <View key={f.label}>
                    <Text className="mb-1.5 text-sm font-medium" style={{ color: colors.textMuted }}>{f.label}</Text>
                    <TextInput
                      value={f.value}
                      onChangeText={f.setter}
                      placeholder={f.ph}
                      placeholderTextColor={colors.textMuted}
                      className="px-4 py-3 rounded-xl"
                      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Review Text */}
            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Your Review</Text>
              <View className="rounded-[18px] p-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <TextInput
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Share your thoughts about this game..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="text-base leading-6"
                  style={{ color: colors.text, minHeight: 120 }}
                />
                <Text className="text-sm mt-2 text-right" style={{ color: colors.textMuted }}>{reviewText.length}/500 characters</Text>
              </View>
            </View>

            {/* Tags */}
            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => handleTagToggle(tag)}
                      className="px-3 py-2 rounded-full"
                      style={active
                        ? { backgroundColor: alpha(colors.lime, 0.18), borderWidth: 1, borderColor: alpha(colors.lime, 0.5) }
                        : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text className="text-sm font-semibold" style={{ color: active ? colors.lime : colors.textDim }}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Privacy Toggle */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between rounded-[18px] p-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <View>
                  <Text className="font-bold" style={{ color: colors.text }}>Public Review</Text>
                  <Text className="text-sm" style={{ color: colors.textMuted }}>Share with the community</Text>
                </View>
                <TouchableOpacity onPress={() => setIsPublic(!isPublic)} activeOpacity={0.9} className="w-12 h-7 rounded-full justify-center" style={{ backgroundColor: isPublic ? colors.lime : colors.elevated }}>
                  <View className="w-5 h-5 bg-white rounded-full" style={{ marginLeft: isPublic ? 26 : 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmitReview} activeOpacity={0.9} className="rounded-[18px] overflow-hidden mb-4 p-4" style={{ backgroundColor: colors.teal, ...glow(colors.teal, 0.4, 16) }}>
              <Text className="text-center font-bold text-lg" style={{ color: colors.void }}>{hasExistingReview ? 'Update Review' : 'Post Review'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Main search and reviews view
  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView className="flex-1 px-5 py-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 110 }}>
          {/* Header */}
          <View className="flex-row items-center gap-3 mb-6">
            <View style={{ width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.coral, ...glow(colors.coral, 0.5, 12) }}>
              <Star size={22} color={colors.void} weight="fill" />
            </View>
            <View>
              <Text className="text-[26px] font-bold" style={{ color: colors.text }}>Game Reviews</Text>
              <Text className="text-[13px]" style={{ color: colors.textMuted }}>Share your gaming experiences</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-6">
            <View
              className="flex-row items-center rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <TextInput
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Search for games to review..."
                placeholderTextColor={colors.textMuted}
                className="flex-1 text-base"
                style={{ color: colors.text }}
              />
              {isSearching ? (
                <ActivityIndicator size="small" color={colors.tealBright} />
              ) : (
                <MagnifyingGlass size={20} color={colors.textMuted} weight="bold" />
              )}
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View className="mt-2 rounded-2xl max-h-72 overflow-hidden" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {searchResults.map((game, i) => (
                    <TouchableOpacity
                      key={game.id}
                      className="p-3 flex-row items-center"
                      style={{ borderBottomWidth: i === searchResults.length - 1 ? 0 : 1, borderBottomColor: colors.border }}
                      onPress={() => handleGameSelect(game)}
                    >
                      {game.cover?.url ? (
                        <Image source={{ uri: game.cover.url.replace('t_thumb', 't_cover_small') }} className="w-10 h-14 rounded-lg mr-3" />
                      ) : (
                        <View className="w-10 h-14 rounded-lg mr-3 items-center justify-center" style={{ backgroundColor: colors.elevated }}>
                          <GameController size={20} color={colors.textMuted} />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="font-semibold" style={{ color: colors.text }} numberOfLines={1}>{game.name}</Text>
                        {game.first_release_date && (
                          <Text className="text-sm" style={{ color: colors.textMuted }}>{new Date(game.first_release_date * 1000).getFullYear()}</Text>
                        )}
                      </View>
                      <View className="w-8 h-8 rounded-full justify-center items-center" style={{ backgroundColor: alpha(colors.teal, 0.16) }}>
                        <Plus size={18} color={colors.tealBright} weight="bold" />
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
              <Text className="text-xl font-bold" style={{ color: colors.text }}>My Reviews</Text>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: alpha(colors.teal, 0.16) }}>
                <Text className="font-bold text-sm" style={{ color: colors.tealBright }}>{myReviews.length}</Text>
              </View>
            </View>

            {myReviews.length === 0 ? (
              <View className="rounded-[20px] p-8 items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <View className="w-16 h-16 rounded-full justify-center items-center mb-4" style={{ backgroundColor: alpha(colors.teal, 0.14) }}>
                  <GameController size={30} color={colors.tealBright} weight="fill" />
                </View>
                <Text className="text-lg font-bold mb-1.5" style={{ color: colors.text }}>No reviews yet</Text>
                <Text className="text-center text-sm" style={{ color: colors.textMuted }}>Search for a game above to write your first review</Text>
              </View>
            ) : (
              <View className="gap-4">
                {myReviews.map((review) => (
                  <View key={review.id} className="rounded-[20px] p-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                    <View className="flex-row mb-3">
                      {((review.game as any).coverUrl || review.game.cover?.url) ? (
                        <Image source={{ uri: (review.game as any).coverUrl || review.game.cover?.url }} className="w-16 h-24 rounded-xl mr-4" />
                      ) : (
                        <View className="w-16 h-24 rounded-xl mr-4 items-center justify-center" style={{ backgroundColor: colors.elevated }}>
                          <GameController size={24} color={colors.textMuted} />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>{review.game.name}</Text>
                        <Text className="text-sm mb-1" style={{ color: getStatusColor(review.status) }}>{getStatusIcon(review.status)} {getStatusLabel(review.status)}</Text>
                        <Text className="text-sm mb-2" style={{ color: colors.textMuted }}>{formatReviewDate(review.date)}</Text>
                        <View className="flex-row items-center">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <Star key={star} size={13} color={star <= review.rating ? colors.gold : alpha(colors.text, 0.18)} weight={star <= review.rating ? 'fill' : 'regular'} />
                          ))}
                          <Text className="ml-2 font-bold" style={{ color: colors.gold }}>{review.rating}/10</Text>
                        </View>
                      </View>
                    </View>
                    {review.reviewText && (
                      <Text className="text-sm leading-5 mb-3" style={{ color: colors.textDim }}>{review.reviewText}</Text>
                    )}
                    {review.tags.length > 0 && (
                      <View className="flex-row flex-wrap gap-2 mb-2">
                        {review.tags.map((tag) => (
                          <View key={tag} className="px-2.5 py-1 rounded-full" style={{ backgroundColor: alpha(colors.lime, 0.14) }}>
                            <Text className="text-xs font-semibold" style={{ color: colors.lime }}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
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