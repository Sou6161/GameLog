import { apiRequest, setToken, getToken } from '@/lib/api';

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
}

function toAppUser(user: BackendUser): AppUser {
  return {
    $id: user.id,
    id: user.id,
    name: user.username,
    username: user.username,
    email: user.email,
    avatar: user.avatarUrl || undefined,
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

  // Get current user (returns null if not authenticated)
  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const token = await getToken();
      if (!token) return null;
      const res = await apiRequest<{ user: BackendUser }>('/api/auth/me', { auth: true });
      return toAppUser(res.user);
    } catch (error) {
      // Token invalid/expired — clear it so the app treats the user as logged out.
      await setToken(null);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
}

export const authService = new AuthService();
