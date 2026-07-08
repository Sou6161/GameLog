// Central HTTP client for the GameLog Node/Postgres backend.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const TOKEN_KEY = '@gamelog_auth_token';

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  return cachedToken;
}

export async function setToken(token: string | null): Promise<void> {
  cachedToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to persist auth token:', err);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach Bearer token if available
}

export async function apiRequest<T = any>(
  path: string,
  { method = 'GET', body, auth = false }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}
