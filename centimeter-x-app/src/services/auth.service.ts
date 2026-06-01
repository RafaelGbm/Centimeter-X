import { api } from './api';
import type { AuthResponse, User } from '../types/models';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const { data } = await api.post<User>('/auth/register', { name, email, password });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/me');
    return data;
  },

  // Revoga o refresh token no servidor (logout real). Best-effort: falha de rede
  // não deve impedir o logout local.
  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },
};
