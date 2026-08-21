import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // On a physical device/emulator, "localhost" means the device itself, not your computer.
  // Derive the dev machine's LAN IP from the same host Expo used to load the JS bundle.
  const hostUri = Constants.expoConfig?.hostUri ??
    (Constants as unknown as {
      manifest2?: {
        extra?: {
          expoClient?: {
            hostUri?: string
          }
        }
      }
    }).manifest2?.extra?.expoClient?.hostUri;

  const host = hostUri?.split(':')?.[0];

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:4000/api`;
  }

  if (Platform.OS === 'android') {
    // Android emulator loopback to the host machine.
    return 'http://10.0.2.2:4000/api';
  }

  return 'http://localhost:4000/api';
}

const API_URL = resolveApiUrl();
const ACCESS_KEY = 'oryn.accessToken';
const REFRESH_KEY = 'oryn.refreshToken';

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {})
    },
  });

  if (response.status === 401 && retry) {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);

    if (refreshToken) {
      const refreshed = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshed.ok) {
        const body = await refreshed.json() as {
          data: {
            accessToken: string;
            refreshToken: string
          }
        };
        await setTokens(body.data.accessToken, body.data.refreshToken);
        return request<T>(path, init, false);
      }
    }
  }

  const body = await response.json().catch(() => null) as {
    error?: {
      message?: string
    }
  } | null;

  if (!response.ok) {
    throw new Error(body?.error?.message ?? 'Request failed.');
  }

  return (body as { data: T }).data;
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken)
  ]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY)
  ]);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  del: <T = void>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};