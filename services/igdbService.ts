import axios from 'axios';
import { Platform } from 'react-native';

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
  private clientSecret = process.env.EXPO_PUBLIC_IGDB_CLIENT_SECRET || 'hvic6qb17hc00lgc8q0d0uowg9kkpa';
  private baseUrl = 'https://api.igdb.com/v4';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Get access token for IGDB API
  private async authenticate(): Promise<string> {
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

  // Get featured games
  async getFeaturedGames(limit: number = 5): Promise<IGDBGame[]> {
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockFeaturedGames(limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockTrendingGames(limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockPopularGames(limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockTopRatedGames(limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockUpcomingGames(limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockIndieGames(limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockGameDetails(gameId);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockGameScreenshots(gameId, limit);
    }
    
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockGameVideos(gameId, limit);
    }
    
    const query = `
      fields checksum, game, name, video_id;
      where game = ${gameId};
      limit ${limit};
    `;
    
    return await this.makeRequest<IGDBVideo[]>('game_videos', query);
  }

  // Get games by genre
  async getGamesByGenre(genreId: number, limit: number = 10): Promise<IGDBGame[]> {
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockGamesByGenre(genreId, limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockRecentlyReleasedGames(limit);
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
    // Use mock data for web platform to avoid CORS issues
    if (Platform.OS === 'web') {
      return this.getMockMostAnticipatedGames(limit);
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

  // Mock data methods for web platform (CORS workaround)
  private getMockFeaturedGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      {
        id: 1942,
        name: 'The Witcher 3: Wild Hunt',
        cover: {
          id: 82563,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp'
        },
        rating: 93.2,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }],
        summary: 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will.'
      },
      {
        id: 1074,
        name: 'Red Dead Redemption 2',
        cover: {
          id: 58735,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp'
        },
        rating: 92.5,
        genres: [{ id: 5, name: 'Shooter' }, { id: 31, name: 'Adventure' }],
        summary: 'America, 1899. The end of the Wild West era has begun as lawmen hunt down the last remaining outlaw gangs.'
      },
      {
        id: 119171,
        name: 'Cyberpunk 2077',
        cover: {
          id: 110775,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dpv.webp'
        },
        rating: 78.3,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }],
        summary: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City.'
      },
      {
        id: 121,
        name: "Baldur's Gate 3",
        cover: {
          id: 230049,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp'
        },
        rating: 96.8,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }],
        summary: 'An ancient evil has returned to Baldur\'s Gate, intent on devouring it from the inside out.'
      }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockTrendingGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      {
        id: 230381,
        name: 'Spider-Man 2',
        cover: {
          id: 286436,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co66pc.webp'
        },
        rating: 87.2,
        genres: [{ id: 31, name: 'Adventure' }],
        summary: 'Spider-Men Peter Parker and Miles Morales face the ultimate test of strength inside and outside the mask.'
      },
      {
        id: 140013,
        name: 'Starfield',
        cover: {
          id: 254250,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5m7a.webp'
        },
        rating: 82.1,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }],
        summary: 'Starfield is the first new universe in 25 years from Bethesda Game Studios.'
      },
      {
        id: 207508,
        name: 'Alan Wake 2',
        cover: {
          id: 309456,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6p9o.webp'
        },
        rating: 89.7,
        genres: [{ id: 9, name: 'Puzzle' }, { id: 15, name: 'Strategy' }],
        summary: 'Alan Wake 2 is a survival horror game and the sequel to the award-winning Alan Wake.'
      }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockPopularGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      {
        id: 113073,
        name: 'Elden Ring',
        cover: {
          id: 94388,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2rs4.webp'
        },
        rating: 95.3,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }],
        summary: 'A new fantasy action RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.'
      },
      {
        id: 136875,
        name: 'God of War Ragnarök',
        cover: {
          id: 230832,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jnq.webp'
        },
        rating: 94.2,
        genres: [{ id: 31, name: 'Adventure' }],
        summary: 'Embark on an epic and heartfelt journey as Kratos and Atreus struggle with holding on and letting go.'
      },
      {
        id: 103168,
        name: 'Hades',
        cover: {
          id: 81092,
          url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp'
        },
        rating: 93.8,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }],
        summary: 'Hades is a god-like rogue-like dungeon crawler that combines the best aspects of Supergiant\'s critically acclaimed titles.'
      },
      { id: 1942, name: 'The Witcher 3: Wild Hunt', cover: { id: 82563, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp' }, rating: 93.2, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'You are Geralt of Rivia, mercenary monster slayer.' },
      { id: 1074, name: 'Red Dead Redemption 2', cover: { id: 58735, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp' }, rating: 92.5, genres: [{ id: 31, name: 'Adventure' }], summary: 'America, 1899. The end of the Wild West era has begun.' },
      { id: 119171, name: 'Cyberpunk 2077', cover: { id: 110775, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dpv.webp' }, rating: 78.3, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City.' },
      { id: 121, name: "Baldur's Gate 3", cover: { id: 230049, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp' }, rating: 96.8, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'An ancient evil has returned to Baldur\'s Gate, intent on devouring it from the inside out.' },
      { id: 230381, name: 'Spider-Man 2', cover: { id: 286436, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co66pc.webp' }, rating: 87.2, genres: [{ id: 31, name: 'Adventure' }], summary: 'Spider-Men Peter Parker and Miles Morales face the ultimate test of strength.' },
      { id: 140013, name: 'Starfield', cover: { id: 254250, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5m7a.webp' }, rating: 82.1, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Starfield is the first new universe in 25 years from Bethesda Game Studios.' },
      { id: 207508, name: 'Alan Wake 2', cover: { id: 309456, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6p9o.webp' }, rating: 89.7, genres: [{ id: 9, name: 'Puzzle' }], summary: 'Alan Wake 2 is a survival horror game and the sequel to the award-winning Alan Wake.' }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockTopRatedGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      { id: 1073, name: 'The Legend of Zelda: Breath of the Wild', cover: { id: 81250, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nme.webp' }, rating: 97.2, genres: [{ id: 31, name: 'Adventure' }], summary: 'Step into a world of discovery, exploration, and adventure.' },
      { id: 121, name: "Baldur's Gate 3", cover: { id: 230049, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp' }, rating: 96.8, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'An ancient evil has returned to Baldur\'s Gate.' },
      { id: 113073, name: 'Elden Ring', cover: { id: 94388, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2rs4.webp' }, rating: 95.3, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'A new fantasy action RPG.' },
      { id: 136875, name: 'God of War Ragnarök', cover: { id: 230832, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jnq.webp' }, rating: 94.2, genres: [{ id: 31, name: 'Adventure' }], summary: 'Embark on an epic and heartfelt journey.' },
      { id: 103168, name: 'Hades', cover: { id: 81092, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp' }, rating: 93.8, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Hades is a god-like rogue-like dungeon crawler.' },
      { id: 74, name: 'The Last of Us Part II', cover: { id: 91468, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyh.webp' }, rating: 93.5, genres: [{ id: 31, name: 'Adventure' }], summary: 'Experience the escalating moral conflicts.' },
      { id: 1942, name: 'The Witcher 3: Wild Hunt', cover: { id: 82563, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp' }, rating: 93.2, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'You are Geralt of Rivia, mercenary monster slayer.' },
      { id: 432, name: 'Persona 5 Royal', cover: { id: 91497, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyk.webp' }, rating: 92.8, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Prepare for an all-new RPG experience.' },
      { id: 1074, name: 'Red Dead Redemption 2', cover: { id: 58735, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp' }, rating: 92.5, genres: [{ id: 31, name: 'Adventure' }], summary: 'America, 1899. The end of the Wild West era.' },
      { id: 28540, name: 'Ghost of Tsushima', cover: { id: 94388, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dpv.webp' }, rating: 91.7, genres: [{ id: 31, name: 'Adventure' }], summary: 'A storm is coming. Venture into the complete experience.' }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockUpcomingGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      { id: 234567, name: 'The Elder Scrolls VI', cover: { id: 300001, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dpv.webp' }, rating: 85.0, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'The highly anticipated next chapter in the Elder Scrolls saga.' },
      { id: 345678, name: 'Grand Theft Auto VI', cover: { id: 300002, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp' }, rating: 90.0, genres: [{ id: 31, name: 'Adventure' }], summary: 'The next installment in the acclaimed GTA series.' },
      { id: 456789, name: 'Wolverine', cover: { id: 300003, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co66pc.webp' }, rating: 82.0, genres: [{ id: 31, name: 'Adventure' }], summary: 'An upcoming Marvel action-adventure game.' },
      { id: 567890, name: 'Final Fantasy VII Rebirth', cover: { id: 300004, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp' }, rating: 88.0, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'The sequel to Final Fantasy VII Remake.' },
      { id: 678901, name: 'Fable', cover: { id: 300005, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5m7a.webp' }, rating: 84.0, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'A new beginning for the legendary Fable franchise.' },
      { id: 789012, name: 'Perfect Dark', cover: { id: 300006, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6p9o.webp' }, rating: 81.0, genres: [{ id: 5, name: 'Shooter' }], summary: 'Agent Joanna Dark returns in this reboot.' },
      { id: 890123, name: 'Avowed', cover: { id: 300007, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2rs4.webp' }, rating: 83.0, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Set in the fantasy world of Eora.' },
      { id: 901234, name: 'State of Decay 3', cover: { id: 300008, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jnq.webp' }, rating: 79.0, genres: [{ id: 31, name: 'Adventure' }], summary: 'The ultimate zombie survival fantasy.' },
      { id: 12345, name: 'Hollow Knight: Silksong', cover: { id: 300009, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp' }, rating: 86.0, genres: [{ id: 8, name: 'Platform' }], summary: 'Play as Hornet, princess-protector of Hallownest.' },
      { id: 123456, name: 'Indiana Jones and the Great Circle', cover: { id: 300010, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp' }, rating: 80.0, genres: [{ id: 31, name: 'Adventure' }], summary: 'Uncover one of history\'s greatest mysteries.' }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockIndieGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      { id: 103168, name: 'Hades', cover: { id: 81092, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp' }, rating: 93.8, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Hades is a god-like rogue-like dungeon crawler.' },
      { id: 26758, name: 'Celeste', cover: { id: 67608, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1h1y.webp' }, rating: 94.2, genres: [{ id: 8, name: 'Platform' }], summary: 'Help Madeline survive her inner demons.' },
      { id: 19560, name: 'Hollow Knight', cover: { id: 74463, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1gom.webp' }, rating: 90.5, genres: [{ id: 8, name: 'Platform' }], summary: 'Forge your own path in Hollow Knight!' },
      { id: 11208, name: 'A Hat in Time', cover: { id: 85259, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1t5v.webp' }, rating: 89.3, genres: [{ id: 8, name: 'Platform' }], summary: 'A cute-as-heck 3D platformer.' },
      { id: 37030, name: 'Ori and the Will of the Wisps', cover: { id: 89072, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ubi.webp' }, rating: 90.8, genres: [{ id: 8, name: 'Platform' }], summary: 'Embark on an all-new adventure.' },
      { id: 7346, name: 'Cuphead', cover: { id: 89254, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v7w.webp' }, rating: 88.7, genres: [{ id: 25, name: 'Arcade' }], summary: 'Classic run and gun action game.' },
      { id: 26192, name: 'Stardew Valley', cover: { id: 132795, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2w6j.webp' }, rating: 89.2, genres: [{ id: 13, name: 'Simulator' }], summary: 'You\'ve inherited your grandfather\'s old farm.' },
      { id: 25311, name: 'Dead Cells', cover: { id: 89386, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v9u.webp' }, rating: 87.9, genres: [{ id: 8, name: 'Platform' }], summary: 'A rogue-lite, metroidvania inspired game.' },
      { id: 37311, name: 'Katana ZERO', cover: { id: 84783, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1t0j.webp' }, rating: 85.4, genres: [{ id: 8, name: 'Platform' }], summary: 'A stylish neo-noir action-platformer.' },
      { id: 55199, name: 'Spiritfarer', cover: { id: 132886, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2w7e.webp' }, rating: 84.6, genres: [{ id: 31, name: 'Adventure' }], summary: 'Play as Stella, ferrymaster to the deceased.' }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockGameDetails(gameId: number): Promise<IGDBGame | null> {
    const allMockGames = [
      {
        id: 1942,
        name: 'The Witcher 3: Wild Hunt',
        cover: { id: 82563, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp' },
        rating: 93.2,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }, { id: 31, name: 'Adventure' }],
        summary: 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will.',
        storyline: 'As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.',
        platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }, { id: 9, name: 'PlayStation 4' }, { id: 49, name: 'Xbox One' }],
        screenshots: [
          { id: 1, url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450' },
          { id: 2, url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450' },
          { id: 3, url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=450' }
        ],
        videos: [
          { id: 1, name: 'Launch Trailer', video_id: 'c0i88t0Kacs' }
        ],
        involved_companies: [
          { id: 1, company: { id: 908, name: 'CD Projekt RED' }, developer: true, publisher: false },
          { id: 2, company: { id: 909, name: 'CD Projekt' }, developer: false, publisher: true }
        ],
        game_modes: [{ id: 1, name: 'Single player' }],
        player_perspectives: [{ id: 2, name: 'Third person' }],
        themes: [{ id: 17, name: 'Fantasy' }, { id: 38, name: 'Open world' }],
        total_rating: 93.2,
        total_rating_count: 2847,
        aggregated_rating: 92.8,
        aggregated_rating_count: 156,
        follows: 15234,
        hypes: 987,
        first_release_date: 1432080000
      },
      {
        id: 113073,
        name: 'Elden Ring',
        cover: { id: 94388, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2rs4.webp' },
        rating: 95.3,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }, { id: 31, name: 'Adventure' }],
        summary: 'A new fantasy action RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
        storyline: 'The Golden Order has been broken. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
        platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }, { id: 167, name: 'PlayStation 5' }, { id: 169, name: 'Xbox Series X|S' }],
        screenshots: [
          { id: 3, url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=450' },
          { id: 4, url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450' },
          { id: 5, url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450' }
        ],
        videos: [
          { id: 2, name: 'Gameplay Trailer', video_id: 'E3Huy2cdih0' }
        ],
        involved_companies: [
          { id: 3, company: { id: 287, name: 'FromSoftware' }, developer: true, publisher: false },
          { id: 4, company: { id: 3687, name: 'Bandai Namco Entertainment' }, developer: false, publisher: true }
        ],
        game_modes: [{ id: 1, name: 'Single player' }, { id: 2, name: 'Multiplayer' }],
        player_perspectives: [{ id: 2, name: 'Third person' }],
        themes: [{ id: 17, name: 'Fantasy' }, { id: 38, name: 'Open world' }],
        total_rating: 95.3,
        total_rating_count: 1924,
        aggregated_rating: 96.1,
        aggregated_rating_count: 89,
        follows: 23456,
        hypes: 1876,
        first_release_date: 1645747200
      },
      {
        id: 121,
        name: "Baldur's Gate 3",
        cover: { id: 230049, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp' },
        rating: 96.8,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }, { id: 16, name: 'Turn-based strategy (TBS)' }],
        summary: 'An ancient evil has returned to Baldur\'s Gate, intent on devouring it from the inside out. The fate of Faerûn lies in your hands.',
        storyline: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.',
        platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }, { id: 167, name: 'PlayStation 5' }, { id: 169, name: 'Xbox Series X|S' }],
        screenshots: [
          { id: 6, url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=450' },
          { id: 7, url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=450' }
        ],
        videos: [
          { id: 3, name: 'Launch Trailer', video_id: 'xyz789uvw' }
        ],
        involved_companies: [
          { id: 5, company: { id: 1756, name: 'Larian Studios' }, developer: true, publisher: true }
        ],
        game_modes: [{ id: 1, name: 'Single player' }, { id: 2, name: 'Multiplayer' }],
        player_perspectives: [{ id: 2, name: 'Third person' }],
        themes: [{ id: 17, name: 'Fantasy' }, { id: 18, name: 'Science fiction' }],
        total_rating: 96.8,
        total_rating_count: 1456,
        aggregated_rating: 96.0,
        aggregated_rating_count: 167,
        follows: 18934,
        hypes: 2341,
        first_release_date: 1691020800
      },
      {
        id: 103168,
        name: 'Hades',
        cover: { id: 81092, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp' },
        rating: 93.8,
        genres: [{ id: 12, name: 'Role-playing (RPG)' }, { id: 8, name: 'Platform' }],
        summary: 'Hades is a god-like rogue-like dungeon crawler that combines the best aspects of Supergiant\'s critically acclaimed titles.',
        storyline: 'Battle out of hell as Zagreus, son of Hades, in this rogue-like dungeon crawler from the creators of Bastion and Transistor.',
        platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }, { id: 130, name: 'Nintendo Switch' }, { id: 167, name: 'PlayStation 5' }],
        screenshots: [
          { id: 8, url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450' },
          { id: 9, url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450' }
        ],
        videos: [
          { id: 4, name: 'Gameplay Trailer', video_id: 'abc123def' }
        ],
        involved_companies: [
          { id: 6, company: { id: 2748, name: 'Supergiant Games' }, developer: true, publisher: true }
        ],
        game_modes: [{ id: 1, name: 'Single player' }],
        player_perspectives: [{ id: 4, name: 'Bird view / Isometric' }],
        themes: [{ id: 17, name: 'Fantasy' }, { id: 27, name: 'Romance' }],
        total_rating: 93.8,
        total_rating_count: 891,
        aggregated_rating: 93.3,
        aggregated_rating_count: 124,
        follows: 12456,
        hypes: 567,
        first_release_date: 1600300800
      },
      {
        id: 230381,
        name: 'Spider-Man 2',
        cover: { id: 286436, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co66pc.webp' },
        rating: 87.2,
        genres: [{ id: 31, name: 'Adventure' }, { id: 25, name: 'Arcade' }],
        summary: 'Spider-Men Peter Parker and Miles Morales face the ultimate test of strength inside and outside the mask.',
        storyline: 'The incredible power of the symbiote forces Peter and Miles to face the ultimate test of strength, both inside and outside the mask, as they balance their lives, friendships and their duty to protect those they love.',
        platforms: [{ id: 167, name: 'PlayStation 5' }],
        screenshots: [
          { id: 10, url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=450' },
          { id: 11, url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=450' }
        ],
        videos: [
          { id: 5, name: 'Launch Trailer', video_id: 'spider123' }
        ],
        involved_companies: [
          { id: 7, company: { id: 1626, name: 'Insomniac Games' }, developer: true, publisher: false },
          { id: 8, company: { id: 10, name: 'Sony Interactive Entertainment' }, developer: false, publisher: true }
        ],
        game_modes: [{ id: 1, name: 'Single player' }],
        player_perspectives: [{ id: 2, name: 'Third person' }],
        themes: [{ id: 1, name: 'Action' }, { id: 38, name: 'Open world' }],
        total_rating: 87.2,
        total_rating_count: 734,
        aggregated_rating: 90.1,
        aggregated_rating_count: 89,
        follows: 9876,
        hypes: 1234,
        first_release_date: 1697673600
      }
    ];
    
    const game = allMockGames.find(g => g.id === gameId);
    return Promise.resolve(game || null);
  }

  private getMockGameScreenshots(gameId: number, limit: number): Promise<IGDBScreenshot[]> {
    const mockScreenshots: IGDBScreenshot[] = [
      { id: 1, game: gameId, url: 'https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc1.webp', width: 1920, height: 1080 },
      { id: 2, game: gameId, url: 'https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc2.webp', width: 1920, height: 1080 },
      { id: 3, game: gameId, url: 'https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc3.webp', width: 1920, height: 1080 },
      { id: 4, game: gameId, url: 'https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc4.webp', width: 1920, height: 1080 },
      { id: 5, game: gameId, url: 'https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc5.webp', width: 1920, height: 1080 }
    ];
    return Promise.resolve(mockScreenshots.slice(0, limit));
  }

  private getMockGameVideos(gameId: number, limit: number): Promise<IGDBVideo[]> {
    const mockVideos: IGDBVideo[] = [
      { id: 1, game: gameId, name: 'Launch Trailer', video_id: 'c0i88t0Kacs', checksum: 'abc123' },
      { id: 2, game: gameId, name: 'Gameplay Trailer', video_id: 'E3Huy2cdih0', checksum: 'def456' },
      { id: 3, game: gameId, name: 'Developer Diary', video_id: 'xyz789uvw', checksum: 'ghi789' }
    ];
    return Promise.resolve(mockVideos.slice(0, limit));
  }

  private getMockGamesByGenre(genreId: number, limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      { id: 1942, name: 'The Witcher 3: Wild Hunt', cover: { id: 82563, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp' }, rating: 93.2, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Epic RPG adventure.' },
      { id: 113073, name: 'Elden Ring', cover: { id: 94388, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2rs4.webp' }, rating: 95.3, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Fantasy action RPG.' },
      { id: 121, name: "Baldur's Gate 3", cover: { id: 230049, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp' }, rating: 96.8, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Turn-based RPG masterpiece.' }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockRecentlyReleasedGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      { id: 230381, name: 'Spider-Man 2', cover: { id: 286436, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co66pc.webp' }, rating: 87.2, genres: [{ id: 31, name: 'Adventure' }], summary: 'Latest Spider-Man adventure.' },
      { id: 207508, name: 'Alan Wake 2', cover: { id: 309456, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6p9o.webp' }, rating: 89.7, genres: [{ id: 9, name: 'Puzzle' }], summary: 'Horror masterpiece sequel.' },
      { id: 140013, name: 'Starfield', cover: { id: 254250, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5m7a.webp' }, rating: 82.1, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Space exploration RPG.' }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }

  private getMockMostAnticipatedGames(limit: number): Promise<IGDBGame[]> {
    const mockGames: IGDBGame[] = [
      { id: 234567, name: 'The Elder Scrolls VI', cover: { id: 300001, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dpv.webp' }, rating: 85.0, genres: [{ id: 12, name: 'Role-playing (RPG)' }], summary: 'Highly anticipated RPG.' },
      { id: 345678, name: 'Grand Theft Auto VI', cover: { id: 300002, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp' }, rating: 90.0, genres: [{ id: 31, name: 'Adventure' }], summary: 'Next GTA installment.' },
      { id: 456789, name: 'Wolverine', cover: { id: 300003, url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co66pc.webp' }, rating: 82.0, genres: [{ id: 31, name: 'Adventure' }], summary: 'Marvel action game.' }
    ];
    return Promise.resolve(mockGames.slice(0, limit));
  }
}

export const igdbService = new IGDBService();
export type { IGDBGame, IGDBScreenshot, IGDBVideo, IGDBCompany };
