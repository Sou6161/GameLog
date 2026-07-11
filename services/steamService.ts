import { apiRequest, ApiError } from '@/lib/api';

export interface SteamStatus {
  connected: boolean;
  steamId: string | null;
  persona: string | null;
  avatar: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  importedCount: number;
  unmatchedCount: number;
}

export interface SteamSyncResult {
  total: number;
  imported: number;
  updated: number;
  unmatched: number;
  // Demos, servers, soundtracks and other non-games we deliberately ignore.
  skipped: number;
}

export interface SteamUnmatchedGame {
  steamAppId: string;
  name: string;
  playtimeMinutes: number;
}

export class SteamService {
  // The Steam OpenID login URL to load in a WebView, plus the path we watch for
  // to know the flow finished.
  static async startAuth(): Promise<{ url: string; callbackPath: string }> {
    return apiRequest<{ url: string; callbackPath: string }>('/api/steam/auth/start', {
      auth: true,
    });
  }

  static async getStatus(): Promise<SteamStatus> {
    return apiRequest<SteamStatus>('/api/steam/status', { auth: true });
  }

  // Import the owned library. Throws ApiError with a readable message for the
  // private-profile and cooldown cases.
  static async sync(force = false): Promise<SteamSyncResult> {
    return apiRequest<SteamSyncResult>('/api/steam/sync', {
      method: 'POST',
      auth: true,
      body: { force },
    });
  }

  static async getUnmatched(): Promise<SteamUnmatchedGame[]> {
    const res = await apiRequest<{ games: SteamUnmatchedGame[] }>('/api/steam/unmatched', {
      auth: true,
    });
    return res.games;
  }

  static async disconnect(): Promise<void> {
    await apiRequest('/api/steam/disconnect', { method: 'POST', auth: true });
  }
}

export { ApiError };
export default SteamService;
