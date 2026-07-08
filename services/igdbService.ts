import axios from 'axios';
import { Platform, Alert } from 'react-native';

// Base URL of the GameLog Node backend (serves the IGDB proxy under /api/games).
const PROXY_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface IGDBGame {
  id: number;
  name: string;
  cover?: { id: number; url: string };
  first_release_date?: number;
  rating?: number;
  rating_count?: number;
  platforms?: { id: number; name: string }[];
  genres?: { id: number; name: string }[];
  summary?: string;
  status?: string;
  screenshots?: { id: number; url: string }[];
  videos?: { id: number; name: string; video_id: string }[];
  involved_companies?: { id: number; company: { id: number; name: string }; developer: boolean; publisher: boolean }[];
  game_modes?: { id: number; name: string }[];
  player_perspectives?: { id: number; name: string }[];
  themes?: { id: number; name: string }[];
  keywords?: { id: number; name: string }[];
  storyline?: string;
  total_rating?: number;
  total_rating_count?: number;
  category?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  follows?: number;
  hypes?: number;
  release_dates?: { id: number; date: number; platform: { id: number; name: string }; region: number }[];
}

interface IGDBScreenshot {
  id: number;
  game: number;
  url: string;
  width: number;
  height: number;
}

interface IGDBVideo {
  id: number;
  game: number;
  name: string;
  video_id: string;
  checksum: string;
}

interface IGDBCompany {
  id: number;
  name: string;
  description?: string;
  logo?: { id: number; url: string };
  country?: number;
  websites?: { id: number; category: number; url: string }[];
}

interface IGDBAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class IGDBService {
  private clientId = process.env.EXPO_PUBLIC_IGDB_CLIENT_ID || 'tiht9z9xigubud8ca68xu0664b4wub';
  private clientSecret = process.env.EXPO_PUBLIC_IGDB_CLIENT_SECRET || '41ejqxud8u68z10yx9feq7w64upcwt';
  private baseUrl = 'https://api.igdb.com/v4';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Log credentials status for debugging
    if (!this.clientId || !this.clientSecret) {
      console.error('❌ IGDB API credentials not found! Please set EXPO_PUBLIC_IGDB_CLIENT_ID and EXPO_PUBLIC_IGDB_CLIENT_SECRET');
    } else {
      console.log('✅ IGDB API credentials loaded');
      console.log('Client ID:', this.clientId.substring(0, 10) + '...');
    }
  }

  // Get access token for IGDB API
  private async authenticate(): Promise<string> {
    // Check if credentials are configured
    if (!this.clientId || !this.clientSecret) {
      throw new Error('IGDB API credentials not configured. Please set EXPO_PUBLIC_IGDB_CLIENT_ID and EXPO_PUBLIC_IGDB_CLIENT_SECRET in your .env file');
    }

    // If token exists and is not expired, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<IGDBAuthResponse>(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry time (subtract 60 seconds as buffer)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('Error authenticating with IGDB:', error);
      throw new Error('Failed to authenticate with IGDB');
    }
  }

  // Make a request to IGDB API
  private async makeRequest<T>(endpoint: string, query: string): Promise<T> {
    const token = await this.authenticate();
    
    try {
      const response = await axios.post<T>(
        `${this.baseUrl}/${endpoint}`,
        query,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error making request to IGDB/${endpoint}:`, error);
      throw new Error(`Failed to fetch data from IGDB/${endpoint}`);
    }
  }

  // Search games via proxy server for web platform
  private async searchGamesViaProxy(query: string, limit: number = 10): Promise<IGDBGame[]> {
    try {
      console.log('🌐 Using proxy server for search:', query);
      const response = await axios.post(`${PROXY_BASE}/api/games/search`, {
        query,
        limit
      });
      
      console.log('✅ Proxy search successful, received', response.data.length, 'games');
      return response.data;
    } catch (error) {
      console.error('❌ Error searching games via proxy:', error);
      throw error; // Don't use mock data, throw error instead
    }
  }

  // Get featured games via proxy server for web platform
  private async getFeaturedGamesViaProxy(limit: number = 5): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/featured?limit=${limit}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching featured games via proxy:', error);
      throw error; // Don't use mock data, throw error instead
    }
  }

  // Get trending games via proxy server for web platform
  private async getTrendingGamesViaProxy(limit: number = 5): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/trending?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending games via proxy:', error);
      throw error;
    }
  }

  // Get popular games via proxy server for web platform
  private async getPopularGamesViaProxy(limit: number = 5): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular games via proxy:', error);
      throw error;
    }
  }

  // Get top rated games via proxy server for web platform
  private async getTopRatedGamesViaProxy(limit: number = 5): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/top-rated?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated games via proxy:', error);
      throw error;
    }
  }

  // Get upcoming games via proxy server for web platform
  private async getUpcomingGamesViaProxy(limit: number = 5): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/upcoming?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming games via proxy:', error);
      throw error;
    }
  }

  // Get indie games via proxy server for web platform
  private async getIndieGamesViaProxy(limit: number = 5): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/indie?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching indie games via proxy:', error);
      throw error;
    }
  }

  // Get games by genre via proxy server for web platform
  private async getGamesByGenreViaProxy(genreId: number, limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/genre/${genreId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching games by genre via proxy:', error);
      throw error;
    }
  }

  // Get recently released games via proxy server for web platform
  private async getRecentlyReleasedGamesViaProxy(limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recently released games via proxy:', error);
      throw error;
    }
  }

  // Get most anticipated games via proxy server for web platform
  private async getMostAnticipatedGamesViaProxy(limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/anticipated?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching most anticipated games via proxy:', error);
      throw error;
    }
  }

  // Get racing games via proxy server for web platform
  private async getRacingGamesViaProxy(limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/racing?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching racing games via proxy:', error);
      throw error;
    }
  }

  // Get sports games via proxy server for web platform
  private async getSportsGamesViaProxy(limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/sports?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sports games via proxy:', error);
      throw error;
    }
  }

  // Get fighting games via proxy server for web platform
  private async getFightingGamesViaProxy(limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/fighting?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fighting games via proxy:', error);
      throw error;
    }
  }

  // Get strategy games via proxy server for web platform
  private async getStrategyGamesViaProxy(limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/strategy?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching strategy games via proxy:', error);
      throw error;
    }
  }

  // Get horror games via proxy server for web platform
  private async getHorrorGamesViaProxy(limit: number = 10): Promise<IGDBGame[]> {
    try {
      const response = await axios.get(`${PROXY_BASE}/api/games/horror?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching horror games via proxy:', error);
      throw error;
    }
  }

  // Get game details via proxy server for web platform
  private async getGameDetailsViaProxy(gameId: number): Promise<IGDBGame | null> {
    try {
      console.log('🎮 Fetching game details via proxy for ID:', gameId);
      const response = await axios.get(`${PROXY_BASE}/api/games/${gameId}`);
      
      console.log('✅ Game details received via proxy:', response.data.name);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching game details via proxy:', error);
      
      // Check if it's a 404 (game not found) vs connection error
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn('⚠️ Game not found in IGDB database');
        return null;
      }
      
      // Don't use mock data, throw error instead
      throw error;
    }
  }

  // Get featured games
  async getFeaturedGames(limit: number = 5): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getFeaturedGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where rating > 75 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    // Process the data to match our format
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get trending games (recently released with good ratings)
  async getTrendingGames(limit: number = 5): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getTrendingGamesViaProxy(limit);
    }
    
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - (365 * 24 * 60 * 60); // 1 year in seconds
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where first_release_date > ${oneYearAgo} & first_release_date < ${now} & rating > 70 & cover != null;
      sort first_release_date desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get popular games (high rating and popularity)
  async getPopularGames(limit: number = 5): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getPopularGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where rating > 80 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get top rated games
  async getTopRatedGames(limit: number = 5): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getTopRatedGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where rating > 90 & rating_count > 100 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get upcoming games
  async getUpcomingGames(limit: number = 5): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getUpcomingGamesViaProxy(limit);
    }
    
    const now = Math.floor(Date.now() / 1000);
    const sixMonthsLater = now + (180 * 24 * 60 * 60); // 6 months in seconds
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where first_release_date > ${now} & first_release_date < ${sixMonthsLater} & cover != null;
      sort first_release_date asc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get indie games
  async getIndieGames(limit: number = 5): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getIndieGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where themes = (42) & rating > 70 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Search games
  async searchGames(query: string, limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.searchGamesViaProxy(query, limit);
    }
    
    const searchQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      search "${query}";
      where cover != null;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', searchQuery);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get game details with comprehensive data
  async getGameDetails(gameId: number): Promise<IGDBGame | null> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getGameDetailsViaProxy(gameId);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, 
             summary, status, screenshots.url, videos.name, videos.video_id, 
             involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
             game_modes.name, player_perspectives.name, themes.name, keywords.name, storyline,
             total_rating, total_rating_count, category, aggregated_rating, aggregated_rating_count,
             follows, hypes, release_dates.date, release_dates.platform.name, release_dates.region;
      where id = ${gameId};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    if (games.length === 0) {
      return null;
    }
    
    const game = games[0];
    return {
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined,
      screenshots: game.screenshots?.map(screenshot => ({
        ...screenshot,
        url: `https:${screenshot.url.replace('t_thumb', 't_screenshot_med')}`
      }))
    };
  }

  // Get game screenshots
  async getGameScreenshots(gameId: number, limit: number = 10): Promise<IGDBScreenshot[]> {
    
    const query = `
      fields game, url, width, height;
      where game = ${gameId};
      limit ${limit};
    `;
    
    const screenshots = await this.makeRequest<IGDBScreenshot[]>('screenshots', query);
    
    return screenshots.map(screenshot => ({
      ...screenshot,
      url: `https:${screenshot.url.replace('t_thumb', 't_screenshot_med')}`
    }));
  }

  // Get game videos
  async getGameVideos(gameId: number, limit: number = 5): Promise<IGDBVideo[]> {
    
    const query = `
      fields checksum, game, name, video_id;
      where game = ${gameId};
      limit ${limit};
    `;
    
    return await this.makeRequest<IGDBVideo[]>('game_videos', query);
  }

  // Get games by genre
  async getGamesByGenre(genreId: number, limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getGamesByGenreViaProxy(genreId, limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = [${genreId}] & rating > 70 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get recently released games
  async getRecentlyReleasedGames(limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getRecentlyReleasedGamesViaProxy(limit);
    }
    
    const now = Math.floor(Date.now() / 1000);
    const threeMonthsAgo = now - (90 * 24 * 60 * 60); // 3 months in seconds
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where first_release_date > ${threeMonthsAgo} & first_release_date < ${now} & cover != null;
      sort first_release_date desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get most anticipated games (high hype count)
  async getMostAnticipatedGames(limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getMostAnticipatedGamesViaProxy(limit);
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary, hypes;
      where first_release_date > ${now} & hypes > 5 & cover != null;
      sort hypes desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get racing games
  async getRacingGames(limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getRacingGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = [10] & rating > 70 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get sports games
  async getSportsGames(limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getSportsGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = [14] & rating > 70 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get fighting games
  async getFightingGames(limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getFightingGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = [4] & rating > 70 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get strategy games
  async getStrategyGames(limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getStrategyGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = [15] & rating > 70 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

  // Get horror games
  async getHorrorGames(limit: number = 10): Promise<IGDBGame[]> {
    // Use proxy server for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return await this.getHorrorGamesViaProxy(limit);
    }
    
    const query = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where themes = [19] & rating > 70 & cover != null;
      sort rating desc;
      limit ${limit};
    `;
    
    const games = await this.makeRequest<IGDBGame[]>('games', query);
    
    return games.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));
  }

}

// Export the service instance
export const igdbService = new IGDBService();
export type { IGDBGame, IGDBScreenshot, IGDBVideo, IGDBCompany };
