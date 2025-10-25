import React, { useState, useEffect } from 'react';
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
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { WebView } from 'react-native-webview';
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
  X,
} from 'phosphor-react-native';
import { useGameDetails } from '@/hooks/useGames';
import { IGDBGame } from '@/services/igdbService';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import { useAchievements } from '@/hooks/useAchievements';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addToLibrary, removeFromLibrary } from '@/store/slices/gameSlice';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useCommunityReviews } from '@/hooks/useCommunityReviews';
import CommunityReviewCard from '@/components/CommunityReviewCard';
import { fetchGameReviews } from '@/store/slices/reviewSlice';
import { useLiveStreams } from '@/hooks/useLiveStreams';
import { LiveStreamCard } from '@/components/LiveStreamCard';
import { twitchService } from '@/services/twitchService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [streamFilters, setStreamFilters] = useState({
    viewerCount: 'all', // all, low, medium, high
    language: 'all', // all, en, es, fr, de, etc.
    duration: 'all', // all, short, medium, long
    quality: 'all', // all, high, medium, low
  });
  const [filteredPage, setFilteredPage] = useState(1);
  const streamsPerPage = 10;
  const dispatch = useDispatch();
  
  // Reset filtered page when filters change
  useEffect(() => {
    setFilteredPage(1);
  }, [streamFilters]);
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
  const libraryGames = useSelector((state: RootState) => state.game.libraryGames);
  const reviewedGameIds = useSelector((state: RootState) => state.game.reviewedGameIds);
  const appwriteCommunityReviews = useSelector((state: RootState) => state.reviews.reviews);
  
  // Achievement tracking
  const { trackGameAdded, trackGameRemoved } = useAchievements();

  // Safely parse the game ID with error handling
  const gameId = id ? parseInt(id, 10) : 0;
  
  // Community reviews
  const { reviews: communityReviews, loading: communityLoading } = useCommunityReviews(String(gameId));
  
  
  // Fetch community reviews from Appwrite when game loads
  useEffect(() => {
    if (gameId) {
      // Test connection first
      import('@/services/reviewService').then(({ ReviewService }) => {
        ReviewService.testConnection().then((success) => {
          if (success) {
            dispatch(fetchGameReviews(String(gameId)) as any);
          } else {
            console.log('Appwrite connection failed, skipping review fetch');
          }
        });
      });
    }
  }, [gameId, dispatch]);
  
  // Don't fetch if gameId is invalid
  const { data: gameDetail, isLoading, error } = useGameDetails(gameId);

  // Live streams - only fetch when we have a game name
  const { streams: liveStreams, allStreams, loading: streamsLoading, error: streamsError, refetch: refetchStreams, pagination } = useLiveStreams(gameDetail?.name || '');

  // Debug: Check what we have
  console.log('🔍 Component render - gameDetail:', gameDetail ? 'EXISTS' : 'NULL');
  console.log('🔍 Component render - gameDetail.name:', gameDetail?.name);

  const isInLibrary = gameDetail ? libraryGames.some(g => g.id === String(gameDetail.id)) : false;
  const hasReviewed = gameDetail ? reviewedGameIds.includes(String(gameDetail.id)) : false;

  // Handle add to library
  const handleAddToLibrary = async () => {
    if (!gameDetail) return;
    if (!isInLibrary) {
      dispatch(addToLibrary({
        id: String(gameDetail.id),
        title: gameDetail.name,
        coverUrl: gameDetail.cover?.url,
        genre: gameDetail.genres?.[0]?.name,
        addedDate: new Date().toLocaleDateString(),
      }));
      const genres = gameDetail?.genres?.map(g => g.name) || [];
      await trackGameAdded(genres);
      showConfirmation(
        'Success',
        'Game added to your library!',
        () => {},
        'success',
        'OK',
        ''
      );
    } else {
      showConfirmation(
        'Remove from Library',
        'Are you sure you want to remove this game from your library?',
        async () => {
          dispatch(removeFromLibrary(String(gameDetail.id)));
          const genres = gameDetail?.genres?.map(g => g.name) || [];
          await trackGameRemoved(genres);
          showConfirmation(
            'Success',
            'Game removed from library!',
            () => {},
            'success',
            'OK',
            ''
          );
        },
        'warning',
        'Remove',
        'Cancel'
      );
    }
  };

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

  // Filter streams based on selected filters
  const getFilteredStreams = (streams: any[]) => {
    if (!streams || streams.length === 0) return [];
    
    const filtered = streams.filter(stream => {
      // Viewer count filter
      if (streamFilters.viewerCount !== 'all') {
        const viewers = stream.viewer_count || 0;
        
        if (streamFilters.viewerCount === 'low') {
          if (viewers > 10) return false;
        } else if (streamFilters.viewerCount === 'medium') {
          if (viewers <= 10 || viewers > 100) return false;
        } else if (streamFilters.viewerCount === 'high') {
          if (viewers <= 100) return false;
        }
      }

      // Language filter
      if (streamFilters.language !== 'all' && stream.language !== streamFilters.language) {
        return false;
      }

      // Duration filter
      if (streamFilters.duration !== 'all') {
        const startTime = new Date(stream.started_at);
        const durationHours = (Date.now() - startTime.getTime()) / (1000 * 60 * 60);
        if (streamFilters.duration === 'short' && durationHours > 2) return false;
        if (streamFilters.duration === 'medium' && (durationHours <= 2 || durationHours > 8)) return false;
        if (streamFilters.duration === 'long' && durationHours <= 8) return false;
      }

      // Quality filter (based on thumbnail resolution)
      if (streamFilters.quality !== 'all') {
        const thumbnailUrl = stream.thumbnail_url;
        if (thumbnailUrl) {
          const width = thumbnailUrl.match(/width=(\d+)/)?.[1];
          if (width) {
            const widthNum = parseInt(width);
            if (streamFilters.quality === 'high' && widthNum < 640) return false;
            if (streamFilters.quality === 'medium' && (widthNum < 320 || widthNum >= 640)) return false;
            if (streamFilters.quality === 'low' && widthNum >= 320) return false;
          }
        }
      }

      return true;
    });

    // Debug logging
    console.log(`🔍 Filter Debug - ${streamFilters.viewerCount}:`, {
      totalStreams: streams.length,
      filteredCount: filtered.length,
      viewerCounts: streams.slice(0, 5).map(s => s.viewer_count),
      filteredViewerCounts: filtered.slice(0, 5).map(s => s.viewer_count)
    });

    return filtered;
  };

  // Get available languages from streams
  const getAvailableLanguages = (streams: any[]) => {
    const languages = [...new Set(streams.map(s => s.language).filter(Boolean))];
    return languages.sort();
  };

  // Custom pagination for filtered streams
  const getFilteredPagination = (allStreams: any[]) => {
    const filteredStreams = getFilteredStreams(allStreams);
    const totalFilteredPages = Math.ceil(filteredStreams.length / streamsPerPage);
    const startIndex = (filteredPage - 1) * streamsPerPage;
    const endIndex = startIndex + streamsPerPage;
    const paginatedFilteredStreams = filteredStreams.slice(startIndex, endIndex);

    return {
      streams: paginatedFilteredStreams,
      totalStreams: filteredStreams.length,
      totalPages: totalFilteredPages,
      currentPage: filteredPage,
      hasNextPage: filteredPage < totalFilteredPages,
      hasPreviousPage: filteredPage > 1,
      goToPage: (page: number) => {
        if (page >= 1 && page <= totalFilteredPages) {
          setFilteredPage(page);
        }
      },
      goToNextPage: () => {
        if (filteredPage < totalFilteredPages) {
          setFilteredPage(filteredPage + 1);
        }
      },
      goToPreviousPage: () => {
        if (filteredPage > 1) {
          setFilteredPage(filteredPage - 1);
        }
      },
    };
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
      <View className="flex-1 justify-center items-center bg-[#0F0F1F] px-6">
        <ActivityIndicator size="large" color="#00D2FF" />
        <View className="mt-4 px-4">
          <Text className="text-white text-sm text-center leading-5">
            Loading game
          </Text>
          <Text className="text-white text-sm text-center leading-5">
            details...
          </Text>
        </View>
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
      <View className="h-[35%] relative">
        <ImageBackground
          source={{ uri: gameDetail.screenshots?.[selectedScreenshot]?.url || gameDetail.cover?.url }}
          className="w-full h-full"
          resizeMode="cover"
        >
          {/* Gradient overlays */}
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.3)', 'transparent', 'rgba(15,15,31,0.9)', 'rgba(15,15,31,1)']}
            className="absolute inset-0"
            locations={[0, 0.2, 0.55, 0.85, 1]}
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

              {/* <View className="flex-row gap-3">
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
              </View> */}
            </View>

            {/* Game Info Overlay */}
            <View className="flex-1 justify-end px-5 pb-7">
              <View className="flex-row gap-4 items-end">
                {/* Game Cover */}
                <View>
                  <Image
                    source={{ uri: gameDetail.cover?.url }}
                    className="w-20 h-28 rounded-2xl"
                    resizeMode="cover"
                  />
                </View>

                {/* Title and meta */}
                <View className="flex-1 min-w-0">
                  <Text className="text-2xl font-extrabold text-white mb-1" numberOfLines={2}>
                    {gameDetail.name}
                  </Text>
                  <View className="flex-row items-center gap-2 min-w-0">
                    <Star size={16} color="#FFD700" weight="fill" />
                    <Text className="text-[#FFD700] font-semibold">
                      {gameDetail.rating ? (gameDetail.rating / 10).toFixed(1) : 'N/A'}
                    </Text>
                    <Text className="text-gray-300 text-xs w-full" numberOfLines={1} ellipsizeMode="tail">({formatNumber(gameDetail.total_rating_count)})</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {gameDetail.genres?.slice(0, 3).map((genre) => (
                      <View key={genre.id} className="bg-white/10 border border-white/20 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">{genre.name}</Text>
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
      <View className="px-4 mb-3">
        <View className="flex-row bg-[#1A1A2E] rounded-2xl p-1 border border-[#2A2A3E]">
          {['overview', 'media', 'details', 'reviews', 'streams'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={`flex-1 py-2 rounded-xl ${
                selectedTab === tab ? 'bg-[#00D2FF]' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold capitalize text-sm ${
                  selectedTab === tab ? 'text-white' : 'text-gray-400'
                }`}
              >
                {tab === 'reviews' ? 'Community' : tab === 'streams' ? 'Live' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {selectedTab === 'overview' && (
          <View className="pb-8">
            {/* Stats Row */}
            <View className="flex-row justify-between mb-6 bg-[#1A1A2E] p-4 rounded-2xl">
              <View className="items-center">
                <View className="w-10 h-10 bg-[#FF4757]/20 rounded-full justify-center items-center mb-2">
                  <Fire size={20} color="#FF4757" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.hypes)}</Text>
                <Text className="text-gray-400 text-xs w-full">Hype</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#00D2FF]/20 rounded-full justify-center items-center mb-2">
                  <Eye size={20} color="#00D2FF" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.follows)}</Text>
                <Text className="text-gray-400 text-xs w-full">Follows</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#FFD700]/20 rounded-full justify-center items-center mb-2">
                  <Trophy size={20} color="#FFD700" weight="fill" />
                </View>
                <Text className="text-white font-bold">{gameDetail.aggregated_rating ? Math.round(gameDetail.aggregated_rating) : '?'}</Text>
                <Text className="text-gray-400 text-xs w-full">Score</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#A78BFA]/20 rounded-full justify-center items-center mb-2">
                  <ThumbsUp size={20} color="#A78BFA" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.aggregated_rating_count)}</Text>
                <Text className="text-gray-400 text-xs w-full">Reviews</Text>
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
              <View className="bg-[#1A1A2E] rounded-2xl p-3 gap-2">
                <View className="flex-col">
                  <Text className="text-gray-400 text-sm mb-1">Release Date</Text>
                  <Text className="text-white font-medium text-sm">
                    {gameDetail.first_release_date ? formatDate(gameDetail.first_release_date) : 'TBA'}
                  </Text>
                </View>
                <View className="flex-col">
                  <Text className="text-gray-400 text-sm mb-1">Developer</Text>
                  <Text className="text-white font-medium text-sm" numberOfLines={2}>
                    {gameDetail.involved_companies?.find(c => c.developer)?.company.name || 'Unknown'}
                  </Text>
                </View>
                <View className="flex-col">
                  <Text className="text-gray-400 text-sm mb-1">Publisher</Text>
                  <Text className="text-white font-medium text-sm" numberOfLines={2}>
                    {gameDetail.involved_companies?.find(c => c.publisher)?.company.name || 'Unknown'}
                  </Text>
                </View>
                <View className="flex-col">
                  <Text className="text-gray-400 text-sm mb-1">Game Modes</Text>
                  <Text className="text-white font-medium text-sm" numberOfLines={2}>
                    {gameDetail.game_modes?.map(mode => mode.name).join(', ') || 'Unknown'}
                  </Text>
                </View>
                <View className="flex-col">
                  <Text className="text-gray-400 text-sm mb-1">Category</Text>
                  <Text className="text-white font-medium text-sm">
                    {gameDetail.category === 0 ? 'Main Game' : 
                     gameDetail.category === 1 ? 'DLC' : 
                     gameDetail.category === 2 ? 'Expansion' : 'Game'}
                  </Text>
                </View>
                <View className="flex-col">
                  <Text className="text-gray-400 text-sm mb-1">Status</Text>
                  <Text className="text-white font-medium text-sm">
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
              <View className="bg-[#1A1A2E] rounded-2xl p-4 gap-5">
                {gameDetail.rating && (
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-400">User Rating</Text>
                      <View className="flex-row items-center gap-2">
                        <Star size={16} color="#FFD700" weight="fill" />
                        <Text className="text-white font-bold">{(gameDetail.rating / 10).toFixed(1)}/10</Text>
                      </View>
                    </View>
                    <View className="w-full h-2 bg-[#0F0F1F] rounded-full overflow-hidden">
                      <View style={{ width: `${Math.min(100, (gameDetail.rating/10)*10*10)}%` }} className="h-full bg-[#FFD700]" />
                    </View>
                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>({formatNumber(gameDetail.rating_count || 0)} votes)</Text>
                  </View>
                )}
                {gameDetail.total_rating && (
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-400">Total Rating</Text>
                      <View className="flex-row items-center gap-2">
                        <Star size={16} color="#00D2FF" weight="fill" />
                        <Text className="text-white font-bold">{(gameDetail.total_rating / 10).toFixed(1)}/10</Text>
                      </View>
                    </View>
                    <View className="w-full h-2 bg-[#0F0F1F] rounded-full overflow-hidden">
                      <View style={{ width: `${Math.min(100, (gameDetail.total_rating/10)*10*10)}%` }} className="h-full bg-[#00D2FF]" />
                    </View>
                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>({formatNumber(gameDetail.total_rating_count || 0)} reviews)</Text>
                  </View>
                )}
                {gameDetail.aggregated_rating && (
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-400">Critics Score</Text>
                      <View className="flex-row items-center gap-2">
                        <Trophy size={16} color="#A78BFA" weight="fill" />
                        <Text className="text-white font-bold">{Math.round(gameDetail.aggregated_rating)}/100</Text>
                      </View>
                    </View>
                    <View className="w-full h-2 bg-[#0F0F1F] rounded-full overflow-hidden">
                      <View style={{ width: `${Math.min(100, Math.round(gameDetail.aggregated_rating))}%` }} className="h-full bg-[#A78BFA]" />
                    </View>
                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>({formatNumber(gameDetail.aggregated_rating_count || 0)} critics)</Text>
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
                    onPress={() => {
                      setGalleryStartIndex(index);
                      setIsGalleryVisible(true);
                    }}
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
                    {/* Overlay to indicate it's clickable */}
                    <View className="absolute inset-0 justify-center items-center">
                      <View className="bg-black/30 rounded-full p-2">
                        <Eye size={16} color="#FFFFFF" weight="fill" />
                      </View>
                    </View>
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
                    onPress={() => {
                      setSelectedVideo(video);
                      setIsVideoModalVisible(true);
                      setIsVideoLoading(true);
                    }}
                    className="bg-[#1A1A2E] rounded-2xl p-4 flex-row items-center gap-3"
                  >
                    <View className="w-12 h-12 bg-[#FF4757] rounded-xl justify-center items-center">
                      <PlayCircle size={20} color="#FFFFFF" weight="fill" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">{video.name}</Text>
                      <Text className="text-gray-400 text-sm">
                        {Platform.OS === 'web' ? 'Tap to play' : 'Tap to play in app'}
                      </Text>
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
                  <View key={company.id || index} className="flex-row justify-between items-start">
                    <Text className="text-gray-400 flex-shrink-0 mr-3">
                      {company.developer ? 'Developer' : company.publisher ? 'Publisher' : 'Company'}
                    </Text>
                    <Text className="text-white font-medium text-right flex-1" numberOfLines={2}>
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
                  <View className="flex-row justify-between items-start">
                    <Text className="text-gray-400 flex-shrink-0 mr-3">Player Perspective</Text>
                    <Text className="text-white font-medium text-right flex-1" numberOfLines={2}>
                      {gameDetail.player_perspectives.map(p => p.name).join(', ')}
                    </Text>
                  </View>
                )}
                {gameDetail.game_modes && gameDetail.game_modes.length > 0 && (
                  <View className="flex-row justify-between items-start">
                    <Text className="text-gray-400 flex-shrink-0 mr-3">Game Modes</Text>
                    <Text className="text-white font-medium text-right flex-1" numberOfLines={2}>
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

        {selectedTab === 'reviews' && (
          <View className="pb-12 px-1">
            {/* Community Reviews Header */}
            <View className="mb-6">
              <Text className="text-white text-2xl font-bold mb-2">Community Reviews</Text>
              <Text className="text-gray-400 text-base">
                See what other players think about this game
              </Text>
            </View>

            {/* Reviews List */}
            {communityLoading ? (
              <View className="items-center py-8">
                <Text className="text-gray-400 text-lg">Loading community reviews...</Text>
              </View>
            ) : appwriteCommunityReviews.length > 0 ? (
              <View className="space-y-4 w-full">
                {appwriteCommunityReviews.map((review) => (
                  <CommunityReviewCard
                    key={review.id}
                    review={{
                      id: review.id,
                      gameId: review.game.id.toString(),
                      gameName: review.game.name,
                      userId: review.userId,
                      username: review.username,
                      userAvatar: review.userAvatar,
                      rating: review.rating,
                      reviewText: review.reviewText,
                      playTime: review.playTime,
                      difficulty: review.difficulty,
                      platform: review.platform,
                      tags: (() => {
                        if (typeof review.tags === 'string' && review.tags) {
                          return (review.tags as string).split(',').filter((tag: string) => tag.trim());
                        }
                        if (Array.isArray(review.tags)) {
                          return review.tags;
                        }
                        return [];
                      })(),
                      isPublic: review.isPublic,
                      date: review.date,
                      helpful: 0, // Not using helpful anymore
                      verified: review.verified,
                    }}
                    onUserPress={(userId) => {
                      // Navigate to user profile (could be implemented later)
                      console.log('Navigate to user profile:', userId);
                    }}
                    gameName={review.game.name}
                    showGameName={false}
                  />
                ))}
              </View>
            ) : (
              <View className="items-center py-8">
                <Text className="text-gray-400 text-lg text-center w-full">
                  No community reviews yet.{'\n'}Be the first to share your thoughts!
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'streams' && (
          <View className="pb-12 px-1">
            {/* Live Streams Header */}
            <View className="mb-6">
              <Text className="text-white text-2xl font-bold mb-2">Live Streams</Text>
              <Text className="text-gray-400 text-base mb-4">
                Watch live gameplay of {gameDetail.name}
              </Text>

              {/* Stream Filters */}
              <View className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2A3E]">
                <Text className="text-white font-semibold mb-3">Filters</Text>
                
                {/* Viewer Count Filter */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-sm mb-2">Viewer Count</Text>
                  <View className="flex-row gap-2">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'low', label: 'Low (0-10)' },
                      { key: 'medium', label: 'Medium (11-100)' },
                      { key: 'high', label: 'High (100+)' }
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        onPress={() => setStreamFilters(prev => ({ ...prev, viewerCount: option.key }))}
                        className={`px-3 py-2 rounded-lg ${
                          streamFilters.viewerCount === option.key
                            ? 'bg-[#00D2FF]'
                            : 'bg-[#2A2A3E]'
                        }`}
                      >
                        <Text className={`text-xs font-medium ${
                          streamFilters.viewerCount === option.key
                            ? 'text-white'
                            : 'text-gray-400'
                        }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Language Filter */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-sm mb-2">Language</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    <TouchableOpacity
                      onPress={() => setStreamFilters(prev => ({ ...prev, language: 'all' }))}
                      className={`px-3 py-2 rounded-lg ${
                        streamFilters.language === 'all'
                          ? 'bg-[#00D2FF]'
                          : 'bg-[#2A2A3E]'
                      }`}
                    >
                      <Text className={`text-xs font-medium ${
                        streamFilters.language === 'all'
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        All Languages
                      </Text>
                    </TouchableOpacity>
                    {getAvailableLanguages(pagination?.totalStreams > 0 ? liveStreams : []).slice(0, 4).map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => setStreamFilters(prev => ({ ...prev, language: lang }))}
                        className={`px-3 py-2 rounded-lg ${
                          streamFilters.language === lang
                            ? 'bg-[#A78BFA]'
                            : 'bg-[#2A2A3E]'
                        }`}
                      >
                        <Text className={`text-xs font-medium ${
                          streamFilters.language === lang
                            ? 'text-white'
                            : 'text-gray-400'
                        }`}>
                          {lang.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Duration Filter */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-sm mb-2">Stream Duration</Text>
                  <View className="flex-row gap-2">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'short', label: 'Short (<2h)' },
                      { key: 'medium', label: 'Medium (2-8h)' },
                      { key: 'long', label: 'Long (8h+)' }
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        onPress={() => setStreamFilters(prev => ({ ...prev, duration: option.key }))}
                        className={`px-3 py-2 rounded-lg ${
                          streamFilters.duration === option.key
                            ? 'bg-[#FF4757]'
                            : 'bg-[#2A2A3E]'
                        }`}
                      >
                        <Text className={`text-xs font-medium ${
                          streamFilters.duration === option.key
                            ? 'text-white'
                            : 'text-gray-400'
                        }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Clear Filters */}
                <TouchableOpacity
                  onPress={() => setStreamFilters({
                    viewerCount: 'all',
                    language: 'all',
                    duration: 'all',
                    quality: 'all',
                  })}
                  className="bg-[#2A2A3E] px-4 py-2 rounded-lg self-start"
                >
                  <Text className="text-gray-400 text-xs font-medium">Clear All Filters</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Streams List */}
            {streamsLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#00D2FF" />
                <Text className="text-gray-400 text-lg mt-4 w-full text-center">Loading live streams...</Text>
              </View>
            ) : streamsError ? (
              <View className="items-center py-8">
                <Text className="text-red-400 text-lg text-center mb-2">
                  Failed to load live streams
                </Text>
                <Text className="text-gray-400 text-sm text-center mb-4">
                  {streamsError}
                </Text>
                <TouchableOpacity
                  onPress={refetchStreams}
                  className="bg-[#00D2FF] px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold">Try Again</Text>
                </TouchableOpacity>
                <Text className="text-gray-500 text-xs text-center mt-3">
                  Make sure Twitch API credentials are configured
                </Text>
              </View>
            ) : allStreams && allStreams.length > 0 ? (
              <View className="w-full">
                {(() => {
                  const filteredPagination = getFilteredPagination(allStreams);
                  return (
                    <>
                      {/* Filtered Streams Count */}
                      <View className="mb-4">
                        <Text className="text-gray-400 text-sm">
                          Showing {filteredPagination.streams.length} of {filteredPagination.totalStreams} filtered streams (from {allStreams.length} total)
                        </Text>
                      </View>

                      {/* Streams List */}
                      <View className="space-y-4 w-full">
                        {filteredPagination.streams.map((stream) => (
                          <LiveStreamCard
                            key={stream.id}
                            stream={stream}
                            streamer={stream.streamer}
                          />
                        ))}
                      </View>

                      {/* Custom Pagination Controls */}
                      {filteredPagination.totalPages > 1 && (
                        <View className="mt-6 bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2A3E]">
                          <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-gray-400 text-sm">
                              Showing {((filteredPagination.currentPage - 1) * streamsPerPage) + 1}-{Math.min(filteredPagination.currentPage * streamsPerPage, filteredPagination.totalStreams)} of {filteredPagination.totalStreams} streams
                            </Text>
                            <Text className="text-white text-sm font-medium">
                              Page {filteredPagination.currentPage} of {filteredPagination.totalPages}
                            </Text>
                          </View>
                          
                          <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                              onPress={filteredPagination.goToPreviousPage}
                              disabled={!filteredPagination.hasPreviousPage}
                              className={`px-4 py-2 rounded-lg ${
                                filteredPagination.hasPreviousPage 
                                  ? 'bg-[#00D2FF]' 
                                  : 'bg-gray-600'
                              }`}
                            >
                              <Text className={`font-semibold ${
                                filteredPagination.hasPreviousPage 
                                  ? 'text-white' 
                                  : 'text-gray-400'
                              }`}>
                                Previous
                              </Text>
                            </TouchableOpacity>

                            {/* Page Numbers */}
                            <View className="flex-row items-center gap-2">
                              {Array.from({ length: Math.min(5, filteredPagination.totalPages) }, (_, i) => {
                                let pageNum;
                                if (filteredPagination.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (filteredPagination.currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (filteredPagination.currentPage >= filteredPagination.totalPages - 2) {
                                  pageNum = filteredPagination.totalPages - 4 + i;
                                } else {
                                  pageNum = filteredPagination.currentPage - 2 + i;
                                }
                                
                                return (
                                  <TouchableOpacity
                                    key={pageNum}
                                    onPress={() => filteredPagination.goToPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg items-center justify-center ${
                                      pageNum === filteredPagination.currentPage
                                        ? 'bg-[#00D2FF]'
                                        : 'bg-[#2A2A3E]'
                                    }`}
                                  >
                                    <Text className={`text-sm font-medium ${
                                      pageNum === filteredPagination.currentPage
                                        ? 'text-white'
                                        : 'text-gray-400'
                                    }`}>
                                      {pageNum}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>

                            <TouchableOpacity
                              onPress={filteredPagination.goToNextPage}
                              disabled={!filteredPagination.hasNextPage}
                              className={`px-4 py-2 rounded-lg ${
                                filteredPagination.hasNextPage 
                                  ? 'bg-[#00D2FF]' 
                                  : 'bg-gray-600'
                              }`}
                            >
                              <Text className={`font-semibold ${
                                filteredPagination.hasNextPage 
                                  ? 'text-white' 
                                  : 'text-gray-400'
                              }`}>
                                Next
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            ) : (
              <View className="items-center py-8">
                <View className="bg-[#2A2A3E] rounded-xl p-6 w-full max-w-sm">
                  <Text className="text-gray-300 text-lg text-center font-semibold mb-2">
                    No Live Streams Found
                  </Text>
                  <Text className="text-gray-400 text-sm text-center mb-4">
                    There are currently no streamers playing {gameDetail.name} on Twitch.
                  </Text>
                  <Text className="text-gray-500 text-xs text-center">
                    Try checking back later or explore other popular games!
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View className="bg-[#1A1A2E] px-4 py-3 border-t border-[#2A2A3E]">
        <SafeAreaView edges={['bottom']}>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleAddToLibrary}
              className="flex-1"
            >
              <LinearGradient
                colors={isInLibrary ? ['#10B981', '#059669'] : ['#00D2FF', '#6c5ce7']}
                className="py-3 rounded-xl flex-row items-center justify-center"
              >
                <GameController size={20} color="#FFFFFF" weight="bold" />
                <Text className="ml-2 text-white font-bold">
                  {isInLibrary ? 'Remove from Library' : 'Add to Library'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                if (gameDetail) {
                  router.push({
                    pathname: '/log',
                    params: { gameId: gameDetail.id.toString(), editMode: hasReviewed ? 'true' : 'false' }
                  });
                }
              }}
              className="bg-[#00D2FF] py-3 px-6 rounded-xl flex-row items-center justify-center"
            >
              <Star size={20} color="#FFFFFF" weight="bold" />
              <Text className="ml-2 text-white font-bold">{hasReviewed ? 'Edit Review' : 'Review'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
      
      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={isGalleryVisible}
        images={gameDetail.screenshots || []}
        initialIndex={galleryStartIndex}
        onClose={() => setIsGalleryVisible(false)}
      />
      
      {/* Video Modal */}
      <Modal
        visible={isVideoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVideoModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <View className="w-full h-[60%] bg-black rounded-t-3xl">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
              <Text className="text-white text-lg font-semibold">
                {selectedVideo?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setIsVideoModalVisible(false)}
                className="w-8 h-8 rounded-full bg-gray-700 justify-center items-center"
              >
                <X size={20} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            </View>
            <View className="flex-1 p-4">
              {Platform.OS === 'web' ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo?.video_id}?autoplay=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: 12 }}
                />
              ) : (
                <View className="flex-1">
                  {isVideoLoading && (
                    <View className="absolute inset-0 bg-black/50 justify-center items-center z-10 rounded-xl">
                      <ActivityIndicator size="large" color="#FF4757" />
                      <Text className="text-white mt-2">Loading video...</Text>
                    </View>
                  )}
                  <WebView
                    source={{ uri: `https://www.youtube.com/embed/${selectedVideo?.video_id}?autoplay=1` }}
                    style={{ flex: 1, borderRadius: 12 }}
                    allowsFullscreenVideo={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    onLoadEnd={() => setIsVideoLoading(false)}
                    onError={() => setIsVideoLoading(false)}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const youtubeUrl = `https://www.youtube.com/watch?v=${selectedVideo?.video_id}`;
                      Linking.openURL(youtubeUrl);
                    }}
                    className="mt-3 bg-[#FF4757] rounded-xl p-3 flex-row items-center justify-center gap-2"
                  >
                    <PlayCircle size={20} color="#FFFFFF" weight="fill" />
                    <Text className="text-white font-semibold">Open in YouTube App</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
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
    </View>
  );
}

export default GameDetailScreen;