import { useState, useEffect } from 'react';
import { twitchService, TwitchStream, TwitchUser } from '../services/twitchService';

interface LiveStreamWithUser extends TwitchStream {
  streamer?: TwitchUser;
}

export const useLiveStreams = (gameName: string) => {
  const [streams, setStreams] = useState<LiveStreamWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStreams, setTotalStreams] = useState(0);
  const streamsPerPage = 10;

  const fetchLiveStreams = async () => {
    if (!gameName || gameName.trim() === '') {
      console.log('🚫 useLiveStreams: No game name provided');
      setStreams([]);
      setLoading(false);
      return;
    }
    
    console.log('🎮 useLiveStreams: Fetching streams for:', gameName);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 useLiveStreams: Testing Twitch connection...');
      const isConnected = await twitchService.testConnection();
      if (!isConnected) {
        console.log('❌ useLiveStreams: Twitch connection test failed');
        setError('Twitch API not configured. Please check your credentials.');
        setStreams([]);
        return;
      }

      console.log('✅ useLiveStreams: Twitch connection test passed');
      console.log('📺 useLiveStreams: Getting live streams...');
      const liveStreams = await twitchService.getLiveStreamsByGame(gameName, 100);
      
      if (liveStreams.length > 0) {
        const userIds = liveStreams.map(stream => stream.user_id);
        const streamers = await twitchService.getStreamerInfo(userIds);
        
        const streamsWithUsers: LiveStreamWithUser[] = liveStreams.map(stream => ({
          ...stream,
          streamer: streamers.find(user => user.id === stream.user_id)
        }));
        
        setTotalStreams(streamsWithUsers.length);
        setStreams(streamsWithUsers);
        setCurrentPage(1); // Reset to first page when new game loads
      } else {
        setStreams([]);
        setTotalStreams(0);
        setCurrentPage(1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live streams');
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useLiveStreams useEffect triggered with gameName:', gameName);
    if (gameName && gameName.trim() !== '') {
      console.log('✅ useLiveStreams: Game name valid, calling fetchLiveStreams');
      fetchLiveStreams();
    } else {
      console.log('❌ useLiveStreams: Game name invalid or empty');
    }
  }, [gameName]);

  // Calculate pagination
  const totalPages = Math.ceil(totalStreams / streamsPerPage);
  const startIndex = (currentPage - 1) * streamsPerPage;
  const endIndex = startIndex + streamsPerPage;
  const paginatedStreams = streams.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    streams: paginatedStreams,
    allStreams: streams, // Return all streams for filtering
    loading,
    error,
    refetch: fetchLiveStreams,
    pagination: {
      currentPage,
      totalPages,
      totalStreams,
      streamsPerPage,
      goToPage,
      goToNextPage,
      goToPreviousPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  };
};
