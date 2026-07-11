import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/services/gameService';
import { igdbService } from '@/services/igdbService';

export function usePopularGames() {
  return useQuery({
    queryKey: ['popularGames'],
    queryFn: () => igdbService.getPopularGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useSearchGames(query: string) {
  return useQuery({
    queryKey: ['searchGames', query],
    queryFn: () => gameService.searchGames(query),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedGames() {
  return useQuery({
    queryKey: ['featuredGames'],
    queryFn: () => igdbService.getFeaturedGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useTrendingGames() {
  return useQuery({
    queryKey: ['trendingGames'],
    queryFn: () => igdbService.getTrendingGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useTopRatedGames() {
  return useQuery({
    queryKey: ['topRatedGames'],
    queryFn: () => igdbService.getTopRatedGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useUpcomingGames() {
  return useQuery({
    queryKey: ['upcomingGames'],
    queryFn: () => igdbService.getUpcomingGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useIndieGames() {
  return useQuery({
    queryKey: ['indieGames'],
    queryFn: () => igdbService.getIndieGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useRecentlyReleasedGames() {
  return useQuery({
    queryKey: ['recentlyReleasedGames'],
    queryFn: () => igdbService.getRecentlyReleasedGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useMostAnticipatedGames() {
  return useQuery({
    queryKey: ['mostAnticipatedGames'],
    queryFn: () => igdbService.getMostAnticipatedGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useHiddenGems() {
  return useQuery({
    queryKey: ['hiddenGems'],
    queryFn: () => igdbService.getHiddenGems(10),
    staleTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useGamesByGenre(genreId: number) {
  return useQuery({
    queryKey: ['gamesByGenre', genreId],
    queryFn: () => igdbService.getGamesByGenre(genreId, 10),
    enabled: !!genreId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useGameScreenshots(gameId: number) {
  return useQuery({
    queryKey: ['gameScreenshots', gameId],
    queryFn: () => igdbService.getGameScreenshots(gameId, 10),
    enabled: !!gameId,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useGameVideos(gameId: number) {
  return useQuery({
    queryKey: ['gameVideos', gameId],
    queryFn: () => igdbService.getGameVideos(gameId, 5),
    enabled: !!gameId,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useGameDetails(igdbId: number) {
  return useQuery({
    queryKey: ['gameDetails', igdbId],
    queryFn: () => igdbService.getGameDetails(igdbId),
    enabled: !!igdbId && igdbId > 0 && !isNaN(igdbId),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useUserGameStatuses(userId: string) {
  return useQuery({
    queryKey: ['userGameStatuses', userId],
    queryFn: () => gameService.getUserGameStatuses(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRacingGames() {
  return useQuery({
    queryKey: ['racingGames'],
    queryFn: () => igdbService.getRacingGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useSportsGames() {
  return useQuery({
    queryKey: ['sportsGames'],
    queryFn: () => igdbService.getSportsGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useFightingGames() {
  return useQuery({
    queryKey: ['fightingGames'],
    queryFn: () => igdbService.getFightingGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useStrategyGames() {
  return useQuery({
    queryKey: ['strategyGames'],
    queryFn: () => igdbService.getStrategyGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useHorrorGames() {
  return useQuery({
    queryKey: ['horrorGames'],
    queryFn: () => igdbService.getHorrorGames(10),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}