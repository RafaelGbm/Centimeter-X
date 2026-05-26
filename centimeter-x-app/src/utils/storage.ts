import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/models';

const ACCESS_TOKEN = '@cx/accessToken';
const REFRESH_TOKEN = '@cx/refreshToken';
const USER = '@cx/user';

export const storage = {
  async saveSession(accessToken: string, refreshToken: string, user: User): Promise<void> {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN, accessToken],
      [REFRESH_TOKEN, refreshToken],
      [USER, JSON.stringify(user)],
    ]);
  },

  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(ACCESS_TOKEN, token);
  },

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_TOKEN, token);
  },

  getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN);
  },

  getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN);
  },

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN, USER]);
  },
};
