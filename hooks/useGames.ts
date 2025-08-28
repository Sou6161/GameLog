import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/services/gameService';

export function useSearchGames(query: string) {
  return useQuery({
    queryKey: ['searchGames', query],
    queryFn: () => gameService.searchGames(query),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrendingGames() {
  return useQuery({
    queryKey: ['trendingGames'],
    queryFn: () => gameService.getTrendingGames(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useGameDetails(igdbId: number) {
  return useQuery({
    queryKey: ['gameDetails', igdbId],
    queryFn: () => gameService.getGameDetails(igdbId),
    enabled: !!igdbId,
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