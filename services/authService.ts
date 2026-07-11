import { apiRequest, setToken, getToken, ApiError } from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

// Backend user shape.
interface BackendUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  profilePrivate?: boolean;
  showReviews?: boolean;
  showActivity?: boolean;
  createdAt?: string;
}

interface AuthResponse {
  token: string;
  user: BackendUser;
}

// App-facing user shape. Keeps the `$id`/`name` fields the rest of the app
// already reads so downstream code is unchanged.
export interface AppUser {
  $id: string;
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  profilePrivate?: boolean;
  showReviews?: boolean;
  showActivity?: boolean;
}

function toAppUser(user: BackendUser): AppUser {
  return {
    $id: user.id,
    id: user.id,
    name: user.username,
    username: user.username,
    email: user.email,
    avatar: user.avatarUrl || undefined,
    createdAt: user.createdAt,
    profilePrivate: user.profilePrivate ?? false,
    showReviews: user.showReviews ?? true,
    showActivity: user.showActivity ?? true,
  };
}

class AuthService {
  // Register new user
  async register({ email, password, username }: RegisterCredentials): Promise<AppUser> {
    try {
      const res = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: { email, password, username },
      });
      await setToken(res.token);
      return toAppUser(res.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login({ email, password }: LoginCredentials): Promise<AppUser> {
    try {
      const res = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      await setToken(res.token);
      return toAppUser(res.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', auth: true });
    } catch (error) {
      // Logout is best-effort for stateless JWT; ignore network errors.
      console.error('Logout error:', error);
    } finally {
      await setToken(null);
    }
  }

  // Get current user.
  //  - returns null when there is no token or the token is rejected (401)
  //  - THROWS on transient failures (network/5xx) so callers can keep the
  //    existing session instead of logging the user out on a blip.
  async getCurrentUser(): Promise<AppUser | null> {
    const token = await getToken();
    if (!token) return null;
    try {
      const res = await apiRequest<{ user: BackendUser }>('/api/auth/me', { auth: true });
      return toAppUser(res.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Genuinely unauthenticated — clear the stale token.
        await setToken(null);
        return null;
      }
      // Transient error (server unreachable, 5xx, timeout): don't touch the token.
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  // Upload an image (data URI) to media storage; returns the hosted URL.
  async uploadImage(dataUri: string, kind: 'avatar' | 'image' | 'video' | 'doc' = 'image'): Promise<string> {
    const res = await apiRequest<{ url: string }>('/api/uploads', {
      method: 'POST',
      auth: true,
      body: { image: dataUri, kind },
    });
    return res.url;
  }

  // Update the current user's profile (avatar, username, privacy) and return
  // the fresh user.
  async updateProfile(patch: {
    avatarUrl?: string;
    username?: string;
    profilePrivate?: boolean;
    showReviews?: boolean;
    showActivity?: boolean;
  }): Promise<AppUser> {
    const res = await apiRequest<{ user: BackendUser }>('/api/auth/me', {
      method: 'PATCH',
      auth: true,
      body: patch,
    });
    return toAppUser(res.user);
  }

  // Permanently delete the current account (and all its data) on the backend,
  // then clear the local token.
  async deleteAccount(): Promise<void> {
    try {
      await apiRequest('/api/users/me', { method: 'DELETE', auth: true });
    } finally {
      await setToken(null);
    }
  }
}

export const authService = new AuthService();
