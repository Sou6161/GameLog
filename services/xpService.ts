import { apiRequest } from '@/lib/api';

export interface XpState {
  xp: number;
  level: number;
  rank: string;
  xpInLevel: number;
  xpPerLevel: number;
  xpToNextLevel: number;
  // XP by source: review | game_added | list_created | achievement | playtime
  breakdown: Record<string, number>;
}

export class XpService {
  static async getXp(): Promise<XpState | null> {
    try {
      return await apiRequest<XpState>('/api/xp', { auth: true });
    } catch (error) {
      console.error('Error fetching XP:', error);
      return null;
    }
  }

  // Claim XP for something the server can't observe (achievements, lists).
  // The server owns the amount — we only report what happened.
  static async awardAchievement(achievementId: string): Promise<XpState | null> {
    return XpService.award('achievement', achievementId);
  }

  static async awardListCreated(listId: string): Promise<XpState | null> {
    return XpService.award('list_created', listId);
  }

  private static async award(kind: string, ref: string): Promise<XpState | null> {
    try {
      return await apiRequest<XpState>('/api/xp/award', {
        method: 'POST',
        auth: true,
        body: { kind, ref },
      });
    } catch (error) {
      // XP is a nice-to-have; never break the user's actual action over it.
      console.error('Error awarding XP:', error);
      return null;
    }
  }
}

export default XpService;
