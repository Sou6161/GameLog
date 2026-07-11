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
import { useGameStore } from '@/store/gameStore';
import { useReviewStore } from '@/store/reviewStore';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';
import CommunityReviewCard from '@/components/CommunityReviewCard';
import { ReviewService } from '@/services/reviewService';
import { useLiveStreams } from '@/hooks/useLiveStreams';
import { LiveStreamCard } from '@/components/LiveStreamCard';
import { twitchService } from '@/services/twitchService';
import MediaPlayerModal, { PlayerMedia } from '@/components/MediaPlayerModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Upgrade an IGDB image URL to a higher-resolution size variant.
// IGDB urls look like: https://images.igdb.com/igdb/image/upload/t_screenshot_med/abc.jpg
function toHiRes(url?: string, size: string = 't_1080p'): string | undefined {
  if (!url) return undefined;
  let out = url.startsWith('//') ? `https:${url}` : url;
  return out.replace(/\/t_[a-z0-9_]+\//i, `/${size}/`);
}

// A label/value row that never clips: label and value each get half the width.
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between" style={{ gap: 16 }}>
      <Text className="text-gray-400 flex-1">{label}</Text>
      <Text className="text-white font-medium text-right flex-1" numberOfLines={3}>{value}</Text>
    </View>
  );
}

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
  // In-app media player (YouTube videos + Twitch live streams)
  const [player, setPlayer] = useState<PlayerMedia | null>(null);
  const [streamFilters, setStreamFilters] = useState({
    viewerCount: 'all', // all, low, medium, high
    language: 'all', // all, en, es, fr, de, etc.
    duration: 'all', // all, short, medium, long
    quality: 'all', // all, high, medium, low
  });
  const [filteredPage, setFilteredPage] = useState(1);
  const streamsPerPage = 10;

  // Reset filtered page when filters change
  useEffect(() => {
    setFilteredPage(1);
  }, [streamFilters]);
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
  const libraryGames = useGameStore((s) => s.libraryGames);
  const reviewedGameIds = useGameStore((s) => s.reviewedGameIds);
  const backendReviews = useReviewStore((s) => s.reviews);
  const addToLibrary = useGameStore((s) => s.addToLibrary);
  const removeFromLibrary = useGameStore((s) => s.removeFromLibrary);
  const fetchGameReviews = useReviewStore((s) => s.fetchGameReviews);
  
  // Achievement tracking
  const { trackGameAdded, trackGameRemoved } = useAchievements();

  // Safely parse the game ID with error handling
  const gameId = id ? parseInt(id, 10) : 0;
  
  // Community reviews (real, from the backend)
  const reviewsLoading = useReviewStore((s) => s.loading);
  const [reviewSort, setReviewSort] = useState<'date' | 'rating'>('date');
  // Optimistic overrides for helpful votes: reviewId -> { helpful, helpfulByMe }
  const [helpfulOverrides, setHelpfulOverrides] = useState<Record<string, { helpful: number; helpfulByMe: boolean }>>({});

  // Fetch this game's public community reviews (re-fetch when sort changes).
  useEffect(() => {
    if (gameId) {
      setHelpfulOverrides({});
      fetchGameReviews(String(gameId), reviewSort);
    }
  }, [gameId, reviewSort]);

  // Toggle a helpful vote with an optimistic UI update.
  const handleHelpful = async (reviewId: string, current: { helpful: number; helpfulByMe: boolean }) => {
    const optimistic = {
      helpful: current.helpful + (current.helpfulByMe ? -1 : 1),
      helpfulByMe: !current.helpfulByMe,
    };
    setHelpfulOverrides((prev) => ({ ...prev, [reviewId]: optimistic }));
    try {
      const result = await ReviewService.voteHelpful(reviewId);
      setHelpfulOverrides((prev) => ({ ...prev, [reviewId]: result }));
    } catch (error) {
      // Revert on failure.
      setHelpfulOverrides((prev) => ({ ...prev, [reviewId]: current }));
    }
  };
  
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
      try {
        await addToLibrary({
          id: String(gameDetail.id),
          title: gameDetail.name,
          coverUrl: gameDetail.cover?.url,
          genre: gameDetail.genres?.[0]?.name,
        });
      } catch {
        showConfirmation(
          'Error',
          'Could not add this game to your library. Please try again.',
          () => {},
          'warning',
          'OK',
          ''
        );
        return;
      }
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
          try {
            await removeFromLibrary(String(gameDetail.id));
          } catch {
            showConfirmation(
              'Error',
              'Could not remove this game. Please try again.',
              () => {},
              'warning',
              'OK',
              ''
            );
            return;
          }
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
      <View className="flex-1 justify-center items-center bg-[#0A0E13] px-5">
        <Text className="text-white text-xl mb-4">Invalid Game ID</Text>
        <Text className="text-gray-400 text-center mb-6">
          Sorry, the game ID is missing or invalid.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          className="bg-[#38BDF8] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0A0E13]">
        <View
          className="w-[70px] h-[70px] rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(20,200,176,0.14)', borderWidth: 1, borderColor: 'rgba(20,200,176,0.3)' }}
        >
          <ActivityIndicator size="large" color="#14C8B0" />
        </View>
        <Text className="text-base font-semibold" style={{ color: '#F2F6F8' }}>Loading game…</Text>
      </View>
    );
  }

  if (error || !gameDetail) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0A0E13] px-5">
        <Text className="text-white text-xl mb-4">Game not found</Text>
        <Text className="text-gray-400 text-center mb-6">
          Sorry, we couldn't load the details for this game.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          className="bg-[#38BDF8] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0E13]">
      <StatusBar style="light" />
      
      {/* Hero banner */}
      <View>
        <View className="relative" style={{ height: 290 }}>
          <ImageBackground
            source={{ uri: toHiRes(gameDetail.screenshots?.[selectedScreenshot]?.url, 't_1080p') || toHiRes(gameDetail.cover?.url, 't_720p') }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Back button */}
          <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0">
            <View className="px-5 pt-2">
              <TouchableOpacity onPress={handleGoBack} className="w-10 h-10 rounded-full overflow-hidden" activeOpacity={0.85}>
                <BlurView intensity={25} tint="dark" className="w-full h-full rounded-full justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
                  <ArrowLeft size={20} color="#FFFFFF" weight="bold" />
                </BlurView>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Info row — below the banner on the solid page background (no overlap) */}
        <View className="px-5 pt-4 flex-row gap-4">
          {/* Cover */}
          <View
            className="rounded-2xl overflow-hidden"
            style={{ borderWidth: 1, borderColor: '#232C37', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
          >
            <Image
              source={{ uri: toHiRes(gameDetail.cover?.url, 't_cover_big') }}
              style={{ width: 100, height: 140 }}
              resizeMode="cover"
            />
          </View>

          {/* Title + meta */}
          <View className="flex-1 justify-center">
            <Text className="text-[21px] font-extrabold text-white mb-2 leading-6" numberOfLines={3}>
              {gameDetail.name}
            </Text>
            <View className="flex-row items-center self-start px-2.5 py-1 rounded-full mb-2.5" style={{ backgroundColor: 'rgba(251,191,36,0.14)' }}>
              <Star size={14} color="#FBBF24" weight="fill" />
              <Text className="text-[#FBBF24] font-bold ml-1.5 text-sm">
                {gameDetail.rating ? (gameDetail.rating / 10).toFixed(1) : 'N/A'}
              </Text>
              <Text className="text-gray-400 text-xs ml-1.5">({formatNumber(gameDetail.total_rating_count)})</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {gameDetail.genres?.slice(0, 2).map((genre) => (
                <View key={genre.id} className="px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(20,200,176,0.14)', borderWidth: 1, borderColor: 'rgba(20,200,176,0.35)' }}>
                  <Text className="text-xs font-semibold" style={{ color: '#2DD4BF' }}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>



      {/* Tab Navigation */}
      <View className="mt-4 mb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View className="flex-row bg-[#12171E] rounded-2xl p-1 border border-[#232C37]">
            {['overview', 'media', 'details', 'reviews', 'streams'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-xl ${selectedTab === tab ? 'bg-[#14C8B0]' : 'bg-transparent'}`}
              >
                <Text
                  className={`text-center font-bold capitalize text-sm ${selectedTab === tab ? 'text-[#06090D]' : 'text-gray-400'}`}
                >
                  {tab === 'reviews' ? 'Community' : tab === 'streams' ? 'Live' : tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {selectedTab === 'overview' && (
          <View className="pb-8">
            {/* Stats Row */}
            <View className="flex-row justify-between mb-6 bg-[#12171E] p-4 rounded-2xl border border-[#232C37]">
              <View className="items-center">
                <View className="w-10 h-10 bg-[#FF7A5C]/20 rounded-full justify-center items-center mb-2">
                  <Fire size={20} color="#FF7A5C" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.hypes)}</Text>
                <Text className="text-gray-400 text-xs w-full">Hype</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#14C8B0]/20 rounded-full justify-center items-center mb-2">
                  <Eye size={20} color="#14C8B0" weight="fill" />
                </View>
                <Text className="text-white font-bold">{formatNumber(gameDetail.follows)}</Text>
                <Text className="text-gray-400 text-xs w-full">Follows</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#FBBF24]/20 rounded-full justify-center items-center mb-2">
                  <Trophy size={20} color="#FBBF24" weight="fill" />
                </View>
                <Text className="text-white font-bold">{gameDetail.aggregated_rating ? Math.round(gameDetail.aggregated_rating) : '?'}</Text>
                <Text className="text-gray-400 text-xs w-full">Score</Text>
              </View>
              
              <View className="items-center">
                <View className="w-10 h-10 bg-[#14C8B0]/20 rounded-full justify-center items-center mb-2">
                  <ThumbsUp size={20} color="#14C8B0" weight="fill" />
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
              <View className="bg-[#12171E] rounded-2xl p-3 gap-2 border border-[#232C37]">
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
              <View className="bg-[#12171E] rounded-2xl p-4 gap-5 border border-[#232C37]">
                {gameDetail.rating && (
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-400">User Rating</Text>
                      <View className="flex-row items-center gap-2">
                        <Star size={16} color="#FBBF24" weight="fill" />
                        <Text className="text-white font-bold">{(gameDetail.rating / 10).toFixed(1)}/10</Text>
                      </View>
                    </View>
                    <View className="w-full h-2 bg-[#0A0E13] rounded-full overflow-hidden">
                      <View style={{ width: `${Math.min(100, (gameDetail.rating/10)*10*10)}%` }} className="h-full bg-[#FBBF24]" />
                    </View>
                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>({formatNumber(gameDetail.rating_count || 0)} votes)</Text>
                  </View>
                )}
                {gameDetail.total_rating && (
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-400">Total Rating</Text>
                      <View className="flex-row items-center gap-2">
                        <Star size={16} color="#14C8B0" weight="fill" />
                        <Text className="text-white font-bold">{(gameDetail.total_rating / 10).toFixed(1)}/10</Text>
                      </View>
                    </View>
                    <View className="w-full h-2 bg-[#0A0E13] rounded-full overflow-hidden">
                      <View style={{ width: `${Math.min(100, (gameDetail.total_rating/10)*10*10)}%` }} className="h-full bg-[#14C8B0]" />
                    </View>
                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>({formatNumber(gameDetail.total_rating_count || 0)} reviews)</Text>
                  </View>
                )}
                {gameDetail.aggregated_rating && (
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-400">Critics Score</Text>
                      <View className="flex-row items-center gap-2">
                        <Trophy size={16} color="#2DD4BF" weight="fill" />
                        <Text className="text-white font-bold">{Math.round(gameDetail.aggregated_rating)}/100</Text>
                      </View>
                    </View>
                    <View className="w-full h-2 bg-[#0A0E13] rounded-full overflow-hidden">
                      <View style={{ width: `${Math.min(100, Math.round(gameDetail.aggregated_rating))}%` }} className="h-full bg-[#2DD4BF]" />
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
                        <View key={genre.id} className="bg-[#38BDF8]/20 border border-[#38BDF8]/40 px-3 py-2 rounded-xl">
                          <Text className="text-[#38BDF8] font-medium">{genre.name}</Text>
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
                        <View key={theme.id} className="bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 px-3 py-2 rounded-xl">
                          <Text className="text-[#2DD4BF] font-medium">{theme.name}</Text>
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
                        <View key={keyword.id} className="bg-[#FF7A5C]/20 border border-[#FF7A5C]/40 px-3 py-2 rounded-xl">
                          <Text className="text-[#FF7A5C] font-medium">{keyword.name}</Text>
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
                    className={`relative ${index === selectedScreenshot ? 'border-2 border-[#38BDF8] rounded-xl' : ''}`}
                  >
                    <Image
                      source={{ uri: screenshot.url }}
                      className="w-48 h-28 rounded-xl mr-3"
                      resizeMode="cover"
                    />
                    {index === selectedScreenshot && (
                      <View className="absolute inset-0 bg-[#38BDF8]/20 rounded-xl" />
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
            {gameDetail.videos && gameDetail.videos.length > 0 && (
              <View className="mb-6">
                <Text className="text-white text-xl font-bold mb-3">Videos</Text>
                <View className="gap-4">
                  {gameDetail.videos.map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      activeOpacity={0.85}
                      onPress={() => video.video_id && setPlayer({ type: 'youtube', id: video.video_id, title: video.name })}
                      className="rounded-2xl overflow-hidden"
                      style={{ backgroundColor: '#12171E', borderWidth: 1, borderColor: '#232C37' }}
                    >
                      {/* Thumbnail */}
                      <View className="relative" style={{ width: '100%', aspectRatio: 16 / 9 }}>
                        <Image
                          source={{ uri: `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg` }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                        <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                          <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(20,200,176,0.95)' }}>
                            <PlayCircle size={30} color="#06090D" weight="fill" />
                          </View>
                        </View>
                      </View>
                      <View className="p-3">
                        <Text className="text-white font-semibold" numberOfLines={2}>{video.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
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
                    className="bg-[#1A212A] border border-[#38BDF8]/30 px-4 py-3 rounded-xl"
                  >
                    <Text className="text-[#38BDF8] font-medium">
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
                <View className="bg-[#1A212A] rounded-2xl p-4 gap-3">
                  {gameDetail.release_dates.slice(0, 5).map((release, index) => (
                    <InfoRow
                      key={index}
                      label={release.platform?.name || 'Unknown Platform'}
                      value={release.date ? formatDate(release.date) : 'TBA'}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Game Development Details */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Development</Text>
              <View className="bg-[#1A212A] rounded-2xl p-4 gap-3">
                {gameDetail.involved_companies?.map((company, index) => (
                  <InfoRow
                    key={company.id || index}
                    label={company.developer ? 'Developer' : company.publisher ? 'Publisher' : 'Company'}
                    value={company.company.name}
                  />
                ))}
              </View>
            </View>

            {/* Game Perspectives & Modes */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Gameplay Details</Text>
              <View className="bg-[#1A212A] rounded-2xl p-4 gap-3">
                {gameDetail.player_perspectives && gameDetail.player_perspectives.length > 0 && (
                  <InfoRow label="Player Perspective" value={gameDetail.player_perspectives.map(p => p.name).join(', ')} />
                )}
                {gameDetail.game_modes && gameDetail.game_modes.length > 0 && (
                  <InfoRow label="Game Modes" value={gameDetail.game_modes.map(m => m.name).join(', ')} />
                )}
              </View>
            </View>

            {/* Community Stats */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Community</Text>
              <View className="bg-[#1A212A] rounded-2xl p-4 gap-3">
                {!!gameDetail.follows && <InfoRow label="Followers" value={formatNumber(gameDetail.follows)} />}
                {!!gameDetail.hypes && <InfoRow label="Hype Level" value={formatNumber(gameDetail.hypes)} />}
                {!!gameDetail.rating_count && <InfoRow label="User Ratings" value={formatNumber(gameDetail.rating_count)} />}
                {!!gameDetail.total_rating_count && <InfoRow label="Total Reviews" value={formatNumber(gameDetail.total_rating_count)} />}
              </View>
            </View>

            {/* Technical Information */}
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">Technical Details</Text>
              <View className="bg-[#1A212A] rounded-2xl p-4 gap-3">
                <InfoRow label="Game ID" value={`#${gameDetail.id}`} />
                <InfoRow
                  label="Category"
                  value={gameDetail.category === 0 ? 'Main Game' : gameDetail.category === 1 ? 'DLC' : gameDetail.category === 2 ? 'Expansion' : 'Game'}
                />
                <InfoRow
                  label="Status"
                  value={typeof gameDetail.status === 'number' && gameDetail.status === 0 ? 'Released' :
                    typeof gameDetail.status === 'number' && gameDetail.status === 2 ? 'Alpha' :
                    typeof gameDetail.status === 'number' && gameDetail.status === 3 ? 'Beta' :
                    typeof gameDetail.status === 'number' && gameDetail.status === 4 ? 'Early Access' :
                    typeof gameDetail.status === 'number' && gameDetail.status === 5 ? 'Offline' :
                    typeof gameDetail.status === 'number' && gameDetail.status === 6 ? 'Cancelled' : 'Unknown'}
                />
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'reviews' && (
          <View className="pb-12 px-1">
            {/* Community Reviews Header */}
            <View className="mb-4">
              <Text className="text-white text-2xl font-bold mb-1">Community Reviews</Text>
              <Text className="text-gray-400 text-base">See what other players think about this game</Text>
            </View>

            {/* Sort toggle */}
            {backendReviews.length > 0 && (
              <View className="flex-row gap-2 mb-4">
                {([['date', 'Newest'], ['rating', 'Top Rated']] as const).map(([value, label]) => {
                  const active = reviewSort === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setReviewSort(value)}
                      className="px-4 py-2 rounded-full"
                      style={active
                        ? { backgroundColor: '#14C8B0' }
                        : { backgroundColor: '#12171E', borderWidth: 1, borderColor: '#232C37' }}
                    >
                      <Text className="font-semibold text-sm" style={{ color: active ? '#06090D' : '#AEB9C4' }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator size="large" color="#14C8B0" />
              </View>
            ) : backendReviews.length > 0 ? (
              <View className="w-full">
                {backendReviews.map((review) => {
                  const tags = typeof review.tags === 'string'
                    ? (review.tags as string).split(',').filter((t: string) => t.trim())
                    : Array.isArray(review.tags) ? review.tags : [];
                  const helpfulState = helpfulOverrides[review.id] ?? {
                    helpful: (review as any).helpful ?? 0,
                    helpfulByMe: (review as any).helpfulByMe ?? false,
                  };
                  return (
                    <CommunityReviewCard
                      key={review.id}
                      review={{
                        id: review.id,
                        userId: review.userId,
                        username: review.username,
                        userAvatar: review.userAvatar,
                        rating: review.rating,
                        reviewText: review.reviewText,
                        playTime: review.playTime,
                        difficulty: review.difficulty,
                        platform: review.platform,
                        tags,
                        date: review.date,
                        verified: review.verified,
                        helpful: helpfulState.helpful,
                        helpfulByMe: helpfulState.helpfulByMe,
                      }}
                      onUserPress={(userId) => router.push({ pathname: '/user/[id]' as any, params: { id: userId } })}
                      onHelpful={(id) => handleHelpful(id, helpfulState)}
                    />
                  );
                })}
              </View>
            ) : (
              <View className="items-center py-10 px-6">
                <Text className="text-gray-400 text-base text-center">No community reviews yet.{'\n'}Be the first to share your thoughts!</Text>
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
              <View className="bg-[#12171E] rounded-xl p-4 border border-[#232C37]">
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
                            ? 'bg-[#14C8B0]'
                            : 'bg-[#232C37]'
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
                          ? 'bg-[#14C8B0]'
                          : 'bg-[#232C37]'
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
                            ? 'bg-[#14C8B0]'
                            : 'bg-[#232C37]'
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
                            ? 'bg-[#FF7A5C]'
                            : 'bg-[#232C37]'
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
                  className="bg-[#232C37] px-4 py-2 rounded-lg self-start"
                >
                  <Text className="text-gray-400 text-xs font-medium">Clear All Filters</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Streams List */}
            {streamsLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#38BDF8" />
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
                  className="bg-[#38BDF8] px-6 py-3 rounded-xl"
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
                            onPress={() => setPlayer({ type: 'twitch', channel: stream.user_login || stream.user_name.toLowerCase(), title: stream.title })}
                          />
                        ))}
                      </View>

                      {/* Custom Pagination Controls */}
                      {filteredPagination.totalPages > 1 && (
                        <View className="mt-6 bg-[#12171E] rounded-xl p-4 border border-[#232C37]">
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
                                  ? 'bg-[#14C8B0]' 
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
                                        ? 'bg-[#14C8B0]'
                                        : 'bg-[#232C37]'
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
                                  ? 'bg-[#14C8B0]' 
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
                <View className="bg-[#232C37] rounded-xl p-6 w-full max-w-sm">
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
      <View className="bg-[#12171E] px-4 py-3 border-t border-[#232C37]">
        <SafeAreaView edges={['bottom']}>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleAddToLibrary}
              activeOpacity={0.9}
              className="flex-1 py-3.5 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: isInLibrary ? '#FF7A5C' : '#14C8B0' }}
            >
              <GameController size={20} color="#06090D" weight="bold" />
              <Text className="ml-2 font-bold" style={{ color: '#06090D' }}>
                {isInLibrary ? 'Remove from Library' : 'Add to Library'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (gameDetail) {
                  router.push({
                    pathname: '/log',
                    params: { gameId: gameDetail.id.toString(), editMode: hasReviewed ? 'true' : 'false', ts: Date.now().toString() }
                  });
                }
              }}
              activeOpacity={0.9}
              className="py-3.5 px-6 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: '#232C37', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <Star size={20} color="#FBBF24" weight="fill" />
              <Text className="ml-2 font-bold text-white">{hasReviewed ? 'Edit Review' : 'Review'}</Text>
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
      
      {/* In-app media player (YouTube videos + Twitch live streams) */}
      <MediaPlayerModal media={player} onClose={() => setPlayer(null)} />

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