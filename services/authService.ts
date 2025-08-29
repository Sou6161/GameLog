import { appwrite, login as rnLogin, register as rnRegister, logout as rnLogout, getCurrentUserSafe } from '@/lib/appwrite';
import { ID } from 'react-native-appwrite';

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
      const user = await rnRegister(email, password, username);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login({ email, password }: LoginCredentials) {
    try {
      const user = await rnLogin(email, password);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await rnLogout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await getCurrentUserSafe();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await getCurrentUserSafe();
      return !!user;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();