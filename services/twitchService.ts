interface TwitchStream {
  id: string;
  user_id: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
}

class TwitchService {
  private clientId: string;
  private accessToken: string;
  private baseUrl = 'https://api.twitch.tv/helix';

  constructor() {
    // Load credentials from environment variables
    this.clientId = process.env.EXPO_PUBLIC_TWITCH_CLIENT_ID || '';
    this.accessToken = process.env.EXPO_PUBLIC_TWITCH_ACCESS_TOKEN || '';
    
    if (!this.clientId || !this.accessToken) {
      console.warn('⚠️ Twitch API credentials not found in environment variables');
      console.warn('Please set EXPO_PUBLIC_TWITCH_CLIENT_ID and EXPO_PUBLIC_TWITCH_ACCESS_TOKEN in your .env file');
    } else {
      console.log('✅ Twitch API credentials loaded from environment');
    }
  }

  private getHeaders() {
    return {
      'Client-ID': this.clientId,
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Twitch API: Unauthorized - Check your credentials');
        } else if (response.status === 403) {
          throw new Error('Twitch API: Forbidden - Check your app permissions');
        } else if (response.status === 429) {
          throw new Error('Twitch API: Rate limited - Too many requests');
        } else {
          throw new Error(`Twitch API error: ${response.status} - ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Twitch API request failed:', error);
      throw error;
    }
  }

  async getLiveStreamsByGame(gameName: string, limit: number = 20): Promise<TwitchStream[]> {
    try {
      // Check if credentials are configured
      if (!this.clientId || !this.accessToken) {
        throw new Error('Twitch API credentials not configured');
      }

      // First, search for the game to get its ID
      const game = await this.searchGame(gameName);
      if (!game) {
        console.log(`Game "${gameName}" not found on Twitch`);
        return [];
      }

      console.log(`🎮 Found game "${gameName}" with ID: ${game.id}`);

      // Fetch live streams for this game - get more streams to ensure we capture low-viewer streams
      const data = await this.makeRequest(`/streams?game_id=${game.id}&first=${Math.min(limit * 2, 100)}`);
      const streams = data.data || [];
      
      // Sort by viewer count (descending) but keep all streams
      const sortedStreams = streams.sort((a, b) => b.viewer_count - a.viewer_count);
      
      console.log(`📺 Found ${streams.length} live streams for "${gameName}" (including 0 viewer streams)`);
      console.log(`📊 Viewer counts: ${sortedStreams.map(s => s.viewer_count).join(', ')}`);
      
      // Return the requested number of streams, but now sorted properly
      return sortedStreams.slice(0, limit);
    } catch (error) {
      console.error('Error fetching live streams:', error);
      throw error;
    }
  }

  private async searchGame(gameName: string): Promise<TwitchGame | null> {
    try {
      // Try exact match first
      let data = await this.makeRequest(`/games?name=${encodeURIComponent(gameName)}`);
      if (data.data && data.data.length > 0) {
        return data.data[0];
      }

      // Try uppercase version
      data = await this.makeRequest(`/games?name=${encodeURIComponent(gameName.toUpperCase())}`);
      if (data.data && data.data.length > 0) {
        return data.data[0];
      }

      // Try lowercase version
      data = await this.makeRequest(`/games?name=${encodeURIComponent(gameName.toLowerCase())}`);
      if (data.data && data.data.length > 0) {
        return data.data[0];
      }

      // Try without numbers (e.g., "Battlefield 6" -> "Battlefield")
      const nameWithoutNumbers = gameName.replace(/\s*\d+\s*$/, '').trim();
      if (nameWithoutNumbers !== gameName) {
        data = await this.makeRequest(`/games?name=${encodeURIComponent(nameWithoutNumbers)}`);
        if (data.data && data.data.length > 0) {
          return data.data[0];
        }
      }

      console.log(`Game "${gameName}" not found with any search variation`);
      return null;
    } catch (error) {
      console.error('Error searching game:', error);
      return null;
    }
  }

  async getStreamerInfo(userIds: string[]): Promise<TwitchUser[]> {
    try {
      if (userIds.length === 0) return [];
      
      const data = await this.makeRequest(`/users?id=${userIds.join('&id=')}`);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching streamer info:', error);
      return [];
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      if (!this.clientId || !this.accessToken) {
        console.log('❌ Twitch API credentials not configured');
        return false;
      }

      // Test with a simple API call
      await this.makeRequest('/games?name=Minecraft');
      console.log('✅ Twitch API connection successful');
      return true;
    } catch (error) {
      console.log('❌ Twitch API connection failed:', error);
      return false;
    }
  }

  formatViewerCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  formatStreamDuration(startedAt: string): string {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }
}

export const twitchService = new TwitchService();
export type { TwitchStream, TwitchUser, TwitchGame };
