import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types/models';

// Tokens vão no SecureStore (criptografado: Keychain no iOS / Keystore no Android).
// Chaves do SecureStore só aceitam [A-Za-z0-9._-].
const ACCESS_TOKEN = 'cx_accessToken';
const REFRESH_TOKEN = 'cx_refreshToken';
// Dado não sensível: AsyncStorage.
const USER = '@cx/user';

export const storage = {
  async saveSession(accessToken: string, refreshToken: string, user: User): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN, refreshToken),
      AsyncStorage.setItem(USER, JSON.stringify(user)),
    ]);
  },

  setAccessToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(ACCESS_TOKEN, token);
  },

  setRefreshToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(REFRESH_TOKEN, token);
  },

  getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN);
  },

  getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN);
  },

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN),
      SecureStore.deleteItemAsync(REFRESH_TOKEN),
      AsyncStorage.removeItem(USER),
    ]);
  },
};
