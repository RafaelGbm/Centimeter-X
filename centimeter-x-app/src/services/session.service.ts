import { api } from './api';
import type { CorrectionSession, Page } from '../types/models';

export const sessionService = {
  async start(
    roverId: number,
    position?: { latitude: number; longitude: number },
  ): Promise<CorrectionSession> {
    const { data } = await api.post<CorrectionSession>(`/rovers/${roverId}/sessions`, position ?? {});
    return data;
  },

  async list(params?: {
    roverId?: number;
    page?: number;
    size?: number;
  }): Promise<Page<CorrectionSession>> {
    const { data } = await api.get<Page<CorrectionSession>>('/sessions', { params });
    return data;
  },

  async get(id: number): Promise<CorrectionSession> {
    const { data } = await api.get<CorrectionSession>(`/sessions/${id}`);
    return data;
  },
};
