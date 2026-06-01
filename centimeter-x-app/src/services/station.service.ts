import { api } from './api';
import type { BaseStation, Id } from '../types/models';

export const stationService = {
  async list(params?: { lat?: number; lon?: number }): Promise<BaseStation[]> {
    const { data } = await api.get<BaseStation[]>('/base-stations', { params });
    return data;
  },

  async get(id: Id): Promise<BaseStation> {
    const { data } = await api.get<BaseStation>(`/base-stations/${id}`);
    return data;
  },
};
