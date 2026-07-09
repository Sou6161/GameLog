import { API_BASE_URL } from '@/lib/api';

interface TwitchStream {
  id: string;
  user_id: string;
  user_name: string;
  user_login?: string;
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

// Twitch is proxied through the GameLog backend (which manages an auto-refreshing
// app access token). No credentials or tokens live in the client anymore.
class TwitchService {
  async getLiveStreamsByGame(gameName: string, limit: number = 20): Promise<TwitchStream[]> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/twitch/streams?game=${encodeURIComponent(gameName)}&limit=${limit}`
      );
      if (!res.ok) throw new Error(`Twitch proxy responded ${res.status}`);
      const data = await res.json();
      const streams: TwitchStream[] = data.streams || [];
      return streams
        .sort((a, b) => b.viewer_count - a.viewer_count)
        .slice(0, limit);
    } catch (error) {
      console.warn('Error fetching live streams:', error);
      throw error;
    }
  }

  async getStreamerInfo(userIds: string[]): Promise<TwitchUser[]> {
    try {
      if (userIds.length === 0) return [];
      const res = await fetch(
        `${API_BASE_URL}/api/twitch/users?ids=${userIds.join(',')}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.users || [];
    } catch (error) {
      console.warn('Error fetching streamer info:', error);
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/twitch/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.ok;
    } catch (error) {
      console.warn('Twitch connection check failed:', error);
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
