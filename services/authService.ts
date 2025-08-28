import { account } from './appwrite';
import { ID } from 'appwrite';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

class AuthService {
  // Register new user
  async register({ email, password, username }: RegisterCredentials) {
    try {
      const user = await account.create(ID.unique(), email, password, username);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login({ email, password }: LoginCredentials) {
    try {
      const session = await account.createEmailSession(email, password);
      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();