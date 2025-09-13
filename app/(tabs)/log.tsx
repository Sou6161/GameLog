import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
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
    <View className="px-5 pb-8">
      <Text className="font-bold text-3xl text-white mb-2">I Played</Text>
      <Text className="text-gray-400 text-lg mb-6">What game did you play?</Text>
      
      {/* Search Bar */}
      <View className="flex-row items-center bg-[#1A2238] rounded-xl px-4 py-3 mb-6 border border-[#374151]">
        <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
        <TextInput
          className="flex-1 ml-3 text-white font-normal text-base"
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
        <View className="items-center py-10">
          <ActivityIndicator size="large" color="#00D2FF" />
          <Text className="text-[#00D2FF] text-lg font-medium mt-4">Searching games...</Text>
        </View>
      )}

      {searchResults.length > 0 && !isSearching && (
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Search Results</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {searchResults.map((game) => (
              <TouchableOpacity
                key={game.id}
                className="flex-row items-center bg-[#1A2238] rounded-xl p-4 mb-3 border border-[#374151]"
                onPress={() => handleGameSelect(game)}
              >
                <Image source={{ uri: game.coverUrl }} className="w-16 h-20 rounded-lg mr-4" />
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-1">{game.title}</Text>
                  <Text className="text-gray-400 text-sm mb-2">{game.genre}</Text>
                  <View className="flex-row items-center">
                    <Star size={16} color="#FFD700" weight="fill" />
                    <Text className="text-[#FFD700] text-sm font-medium ml-1">{game.rating}</Text>
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
    <View className="px-5 pb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={handleBackToSearch} className="w-10 h-10 rounded-full justify-center items-center">
          <ArrowLeft size={24} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text className="font-bold text-xl text-white">I Played</Text>
        <TouchableOpacity onPress={handleSaveReview} className="w-10 h-10 rounded-full justify-center items-center">
          <Check size={24} color="#00D2FF" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Game Info */}
      <View className="items-center mb-6">
        <Image source={{ uri: selectedGame?.coverUrl }} className="w-24 h-32 rounded-xl mb-4" />
        <Text className="text-white text-xl font-bold mb-4 text-center">{selectedGame?.title}</Text>
        <TouchableOpacity 
          className="rounded-xl overflow-hidden"
          onPress={handleAddToLibrary}
        >
          <LinearGradient
            colors={['#00D2FF', '#6c5ce7']}
            className="flex-row items-center justify-center px-6 py-3"
          >
            <Plus size={16} color="#FFFFFF" weight="bold" />
            <Text className="text-white font-semibold ml-2">Add to Library</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Date Selection */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Calendar size={20} color="#94A3B8" weight="bold" />
          <Text className="text-white font-medium ml-3">Date</Text>
        </View>
        <View className="flex-row items-center bg-[#1A2238] rounded-xl px-4 py-3 border border-[#374151]">
          <Text className="text-white font-medium mr-2">{watchDate}</Text>
          <TouchableOpacity className="ml-2">
            <X size={16} color="#94A3B8" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Rating */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Star size={20} color="#94A3B8" weight="bold" />
          <Text className="text-white font-medium ml-3">Rate</Text>
        </View>
        <View className="flex-row items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              className="mr-2"
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
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Heart size={20} color="#94A3B8" weight="bold" />
          <Text className="text-white font-medium ml-3">Like</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setLiked(!liked)}
          className="flex-row items-center"
        >
          <Heart 
            size={24} 
            color={liked ? "#FF6B6B" : "#374151"} 
            weight={liked ? "fill" : "regular"} 
          />
          <Text className={`font-medium ml-2 ${liked ? 'text-[#FF6B6B]' : 'text-[#94A3B8]'}`}>
            Like
          </Text>
        </TouchableOpacity>
      </View>

      {/* Review */}
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Add review...</Text>
        <TextInput
          className="bg-[#1A2238] rounded-xl px-4 py-3 border border-[#374151] text-white font-normal text-base min-h-[120px]"
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
      <View className="mb-6">
        <Text className="text-white font-medium mb-3">Add tags...</Text>
        <View className="flex-row flex-wrap gap-2">
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
              className={`flex-row items-center px-3 py-2 rounded-lg border ${
                selectedTags.includes(tag.id) 
                  ? 'bg-[#00D2FF]/20 border-[#00D2FF]' 
                  : 'bg-[#1A2238] border-[#374151]'
              }`}
              onPress={() => toggleTag(tag.id)}
            >
              <Text className="text-lg mr-2">{tag.icon}</Text>
              <Text className={`font-medium text-sm ${
                selectedTags.includes(tag.id) ? 'text-[#00D2FF]' : 'text-white'
              }`}>
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
         colors={['#0F0F1F', '#121631', '#0A2342']}

      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {showReviewPage ? renderReviewPage() : renderGameSelection()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
