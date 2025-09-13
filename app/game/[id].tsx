import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Star,
  Heart,
  Share,
  Calendar,
  Users,
  GameController,
  Trophy,
  Fire,
  Eye,
  ThumbsUp,
  PlayCircle,
} from 'phosphor-react-native';
import { useGameDetails } from '@/hooks/useGames';
import { IGDBGame } from '@/services/igdbService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);

  // Safely parse the game ID with error handling
  const gameId = id ? parseInt(id, 10) : 0;
  
  // Don't fetch if gameId is invalid
  const { data: gameDetail, isLoading, error } = useGameDetails(gameId);

  // Safe navigation function
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) {
      return 'TBA';
    }
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num?: number) => {
    if (!num || typeof num !== 'number') {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Show error if no valid ID is provided
  if (!id || gameId === 0 || isNaN(gameId)) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0F0F1F] px-5">
        <Text className="text-white text-xl mb-4">Invalid Game ID</Text>
        <Text className="text-gray-400 text-center mb-6">
          Sorry, the game ID is missing or invalid.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          className="bg-[#00D2FF] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0F0F1F]">
        <ActivityIndicator size="large" color="#00D2FF" />
        <Text className="text-white text-lg mt-4">Loading game details...</Text>
      </View>
    );
  }

  if (error || !gameDetail) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0F0F1F] px-5">
        <Text className="text-white text-xl mb-4">Game not found</Text>
        <Text className="text-gray-400 text-center mb-6">
          Sorry, we couldn't load the details for this game.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          className="bg-[#00D2FF] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0F0F1F]">
      <StatusBar style="light" />
      
      {/* Hero Section */}
      <View className="h-[45%] relative">
        <ImageBackground
          source={{ uri: gameDetail.screenshots?.[selectedScreenshot]?.url || gameDetail.cover?.url }}
          className="w-full h-full"
          resizeMode="cover"
        >
          {/* Gradient overlays */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'transparent', 'rgba(15,15,31,0.8)', 'rgba(15,15,31,1)']}
            className="absolute inset-0"
            locations={[0, 0.2, 0.5, 0.8, 1]}
          />

          {/* Header */}
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-between items-center px-5 pt-2">
              <TouchableOpacity
                onPress={handleGoBack}
                className="w-10 h-10 rounded-full bg-black/50 justify-center items-center"
              >
                <BlurView intensity={20} className="w-full h-full rounded-full justify-center items-center">
                  <ArrowLeft size={20} color="#FFFFFF" weight="bold" />
                </BlurView>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setIsBookmarked(!isBookmarked)}
                  className="w-10 h-10 rounded-full bg-black/50 justify-center items-center"
                >
                  <BlurView intensity={20} className="w-full h-full rounded-full justify-center items-center">
                    <Heart
                      size={20}
                      color={isBookmarked ? "#FF4757" : "#FFFFFF"}
                      weight={isBookmarked ? "fill" : "bold"}
                    />
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-black/50 justify-center items-center">
                  <BlurView intensity={20} className="w-full h-full rounded-full justify-center items-center">
                    <Share size={20} color="#FFFFFF" weight="bold" />
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>

            {/* Game Info Overlay */}
            <View className="flex-1 justify-end px-5 pb-8">
              <View className="flex-row items-end gap-4">
                {/* Game Cover */}
                <View className="relative">
                  <Image
                    source={{ uri: gameDetail.cover?.url }}
                    className="w-24 h-32 rounded-2xl"
                    resizeMode="cover"
                  />
                  <View className="absolute -top-2 -right-2 bg-[#FFD700] rounded-full w-8 h-8 justify-center items-center">
                    <Text className="text-xs font-bold text-black">
                      {gameDetail.rating ? Math.round(gameDetail.rating / 10) : '?'}
                    </Text>
                  </View>
                </View>

                {/* Game Details */}
                <View className="flex-1">
                  <Text className="text-3xl font-bold text-white mb-2" numberOfLines={2}>
                    {gameDetail.name}
                  </Text>
                  
                  <View className="flex-row items-center gap-2 mb-3">
                    <Star size={16} color="#FFD700" weight="fill" />
                    <Text className="text-[#FFD700] font-semibold">
                      {gameDetail.rating ? (gameDetail.rating / 10).toFixed(1) : 'N/A'}
                    </Text>
                    <Text className="text-gray-400">
                      ({formatNumber(gameDetail.total_rating_count)})
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {gameDetail.genres?.slice(0, 2).map((genre) => (
                      <View
                        key={genre.id}
                        className="bg-[#00D2FF]/20 border border-[#00D2FF]/40 px-3 py-1 rounded-full"
                      >
                        <Text className="text-[#00D2FF] text-xs font-medium">
                          {genre.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>



      {/* Tab Navigation */}
      <View className="px-5 mb-4">
        <View className="flex-row bg-[#1A1A2E] rounded-2xl p-1">
          {['overview', 'media', 'details'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={`flex-1 py-3 rounded-xl ${
                selectedTab === tab ? 'bg-[#00D2FF]' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold capitalize ${
                  selectedTab === tab ? 'text-white' : 'text-gray-400'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && (
          <View className="pb-8">
            {/* Stats Row */}
            <View className="flex-row justify-between mb-6 bg-[#1A1A2E] p-4 rounded-2xl">
              <View className="items-center">
                <View className="w-10 h-10 bg-[#FF4757]/20 rounded-full justify-center items-center mb-2">
                  <Fire size={20} color="#FF4757" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.hypes)}</Text>
                <Text className="text-gray-400 text-xs">Hype</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#00D2FF]/20 rounded-full justify-center items-center mb-2">
                  <Eye size={20} color="#00D2FF" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.follows)}</Text>
                <Text className="text-gray-400 text-xs">Follows</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#FFD700]/20 rounded-full justify-center items-center mb-2">
                  <Trophy size={20} color="#FFD700" weight="fill" />
                </View>
                <Text className="text-white font-bold">{gameDetail.aggregated_rating ? Math.round(gameDetail.aggregated_rating) : '?'}</Text>
                <Text className="text-gray-400 text-xs">Score</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#A78BFA]/20 rounded-full justify-center items-center mb-2">
                  <ThumbsUp size={20} color="#A78BFA" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.aggregated_rating_count)}</Text>
                <Text className="text-gray-400 text-xs">Reviews</Text>
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">About This Game</Text>
              {gameDetail.summary && (
                <Text className="text-gray-300 leading-6 mb-4">
                  {gameDetail.summary}
                </Text>
              )}
              {gameDetail.storyline && (
                <Text className="text-gray-300 leading-6">
                  {gameDetail.storyline}
                </Text>
              )}
            </View>

            {/* Detailed Game Information */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Game Information</Text>
              <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Release Date</Text>
                  <Text className="text-white font-medium">
                    {gameDetail.first_release_date ? formatDate(gameDetail.first_release_date) : 'TBA'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Developer</Text>
                  <Text className="text-white font-medium" numberOfLines={1}>
                    {gameDetail.involved_companies?.find(c => c.developer)?.company.name || 'Unknown'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Publisher</Text>
                  <Text className="text-white font-medium" numberOfLines={1}>
                    {gameDetail.involved_companies?.find(c => c.publisher)?.company.name || 'Unknown'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Game Modes</Text>
                  <Text className="text-white font-medium" numberOfLines={1}>
                    {gameDetail.game_modes?.map(mode => mode.name).join(', ') || 'Unknown'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Category</Text>
                  <Text className="text-white font-medium">
                    {gameDetail.category === 0 ? 'Main Game' : 
                     gameDetail.category === 1 ? 'DLC' : 
                     gameDetail.category === 2 ? 'Expansion' : 'Game'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Status</Text>
                  <Text className="text-white font-medium">
                    {typeof gameDetail.status === 'number' && gameDetail.status === 0 ? 'Released' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 2 ? 'Alpha' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 3 ? 'Beta' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 4 ? 'Early Access' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 5 ? 'Offline' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 6 ? 'Cancelled' : 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Rating Breakdown */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Ratings & Reviews</Text>
              <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-4">
                {gameDetail.rating && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">User Rating</Text>
                    <View className="flex-row items-center gap-2">
                      <Star size={16} color="#FFD700" weight="fill" />
                      <Text className="text-white font-bold">{(gameDetail.rating / 10).toFixed(1)}/10</Text>
                      <Text className="text-gray-400">({formatNumber(gameDetail.rating_count || 0)} votes)</Text>
                    </View>
                  </View>
                )}
                {gameDetail.total_rating && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">Total Rating</Text>
                    <View className="flex-row items-center gap-2">
                      <Star size={16} color="#00D2FF" weight="fill" />
                      <Text className="text-white font-bold">{(gameDetail.total_rating / 10).toFixed(1)}/10</Text>
                      <Text className="text-gray-400">({formatNumber(gameDetail.total_rating_count || 0)} reviews)</Text>
                    </View>
                  </View>
                )}
                {gameDetail.aggregated_rating && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">Critics Score</Text>
                    <View className="flex-row items-center gap-2">
                      <Trophy size={16} color="#A78BFA" weight="fill" />
                      <Text className="text-white font-bold">{Math.round(gameDetail.aggregated_rating)}/100</Text>
                      <Text className="text-gray-400">({formatNumber(gameDetail.aggregated_rating_count || 0)} critics)</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Genres & Themes */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Genres & Themes</Text>
              <View className="gap-3">
                {gameDetail.genres && gameDetail.genres.length > 0 && (
                  <View>
                    <Text className="text-gray-400 mb-2">Genres</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {gameDetail.genres.map((genre) => (
                        <View key={genre.id} className="bg-[#00D2FF]/20 border border-[#00D2FF]/40 px-3 py-2 rounded-xl">
                          <Text className="text-[#00D2FF] font-medium">{genre.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {gameDetail.themes && gameDetail.themes.length > 0 && (
                  <View className="mt-3">
                    <Text className="text-gray-400 mb-2">Themes</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {gameDetail.themes.map((theme) => (
                        <View key={theme.id} className="bg-[#A78BFA]/20 border border-[#A78BFA]/40 px-3 py-2 rounded-xl">
                          <Text className="text-[#A78BFA] font-medium">{theme.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {gameDetail.keywords && gameDetail.keywords.length > 0 && (
                  <View className="mt-3">
                    <Text className="text-gray-400 mb-2">Keywords</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {gameDetail.keywords.slice(0, 6).map((keyword) => (
                        <View key={keyword.id} className="bg-[#FF4757]/20 border border-[#FF4757]/40 px-3 py-2 rounded-xl">
                          <Text className="text-[#FF4757] font-medium">{keyword.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'media' && (
          <View className="pb-8">
            {/* Screenshots */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Screenshots</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="gap-3"
              >
                {gameDetail.screenshots?.map((screenshot, index) => (
                  <TouchableOpacity
                    key={screenshot.id}
                    onPress={() => setSelectedScreenshot(index)}
                    className={`relative ${index === selectedScreenshot ? 'border-2 border-[#00D2FF] rounded-xl' : ''}`}
                  >
                    <Image
                      source={{ uri: screenshot.url }}
                      className="w-48 h-28 rounded-xl mr-3"
                      resizeMode="cover"
                    />
                    {index === selectedScreenshot && (
                      <View className="absolute inset-0 bg-[#00D2FF]/20 rounded-xl" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Videos */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Videos</Text>
              <View className="gap-3">
                {gameDetail.videos?.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    className="bg-[#1A1A2E] rounded-2xl p-4 flex-row items-center gap-3"
                  >
                    <View className="w-12 h-12 bg-[#FF4757] rounded-xl justify-center items-center">
                      <PlayCircle size={20} color="#FFFFFF" weight="fill" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">{video.name}</Text>
                      <Text className="text-gray-400 text-sm">Video ID: {video.video_id}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'details' && (
          <View className="pb-8">
            {/* Platforms */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Available Platforms</Text>
              <View className="flex-row flex-wrap gap-2">
                {gameDetail.platforms?.map((platform) => (
                  <View
                    key={platform.id}
                    className="bg-[#1A1A2E] border border-[#00D2FF]/30 px-4 py-3 rounded-xl"
                  >
                    <Text className="text-[#00D2FF] font-medium">
                      {platform.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Release Dates by Platform */}
            {gameDetail.release_dates && gameDetail.release_dates.length > 0 && (
              <View className="mb-6">
                <Text className="text-white text-xl font-bold mb-3">Release Dates</Text>
                <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-3">
                  {gameDetail.release_dates.slice(0, 5).map((release, index) => (
                    <View key={index} className="flex-row justify-between items-center">
                      <Text className="text-gray-400">{release.platform?.name || 'Unknown Platform'}</Text>
                      <Text className="text-white font-medium">
                        {release.date ? formatDate(release.date) : 'TBA'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Game Development Details */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Development</Text>
              <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-3">
                {gameDetail.involved_companies?.map((company, index) => (
                  <View key={company.id || index} className="flex-row justify-between items-center">
                    <Text className="text-gray-400">
                      {company.developer ? 'Developer' : company.publisher ? 'Publisher' : 'Company'}
                    </Text>
                    <Text className="text-white font-medium" numberOfLines={1}>
                      {company.company.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Game Perspectives & Modes */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Gameplay Details</Text>
              <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-3">
                {gameDetail.player_perspectives && gameDetail.player_perspectives.length > 0 && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">Player Perspective</Text>
                    <Text className="text-white font-medium">
                      {gameDetail.player_perspectives.map(p => p.name).join(', ')}
                    </Text>
                  </View>
                )}
                {gameDetail.game_modes && gameDetail.game_modes.length > 0 && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">Game Modes</Text>
                    <Text className="text-white font-medium">
                      {gameDetail.game_modes.map(m => m.name).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Community Stats */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Community</Text>
              <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-3">
                {gameDetail.follows && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">Followers</Text>
                    <Text className="text-white font-medium">{formatNumber(gameDetail.follows)}</Text>
                  </View>
                )}
                {gameDetail.hypes && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">Hype Level</Text>
                    <Text className="text-white font-medium">{formatNumber(gameDetail.hypes)}</Text>
                  </View>
                )}
                {gameDetail.rating_count && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">User Ratings</Text>
                    <Text className="text-white font-medium">{formatNumber(gameDetail.rating_count)}</Text>
                  </View>
                )}
                {gameDetail.total_rating_count && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400">Total Reviews</Text>
                    <Text className="text-white font-medium">{formatNumber(gameDetail.total_rating_count)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Technical Information */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Technical Details</Text>
              <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400">Game ID</Text>
                  <Text className="text-white font-medium">#{gameDetail.id}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400">Category</Text>
                  <Text className="text-white font-medium">
                    {gameDetail.category === 0 ? 'Main Game' : 
                     gameDetail.category === 1 ? 'DLC' : 
                     gameDetail.category === 2 ? 'Expansion' : 'Game'}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400">Status</Text>
                  <Text className="text-white font-medium">
                    {typeof gameDetail.status === 'number' && gameDetail.status === 0 ? 'Released' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 2 ? 'Alpha' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 3 ? 'Beta' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 4 ? 'Early Access' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 5 ? 'Offline' : 
                     typeof gameDetail.status === 'number' && gameDetail.status === 6 ? 'Cancelled' : 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default GameDetailScreen;