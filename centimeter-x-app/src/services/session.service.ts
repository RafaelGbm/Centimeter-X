import { api } from './api';
import type { CorrectionSession, Id, Page } from '../types/models';

export const sessionService = {
  async start(
    roverId: Id,
    position?: { latitude: number; longitude: number },
  ): Promise<CorrectionSession> {
    const { data } = await api.post<CorrectionSession>(`/rovers/${roverId}/sessions`, position ?? {});
    return data;
  },

  async list(params?: {
    roverId?: Id;
    page?: number;
    size?: number;
  }): Promise<Page<CorrectionSession>> {
    const { data } = await api.get<Page<CorrectionSession>>('/sessions', { params });
    return data;
  },

  async get(id: Id): Promise<CorrectionSession> {
    const { data } = await api.get<CorrectionSession>(`/sessions/${id}`);
    return data;
  },
};
