import { api } from './api';
import type { Id, Page, Rover, RoverType } from '../types/models';

export interface RoverInput {
  name: string;
  type: RoverType;
  baseStationId: Id;
}

export const roverService = {
  async list(params?: { search?: string; page?: number; size?: number }): Promise<Page<Rover>> {
    const { data } = await api.get<Page<Rover>>('/rovers', { params });
    return data;
  },

  async get(id: Id): Promise<Rover> {
    const { data } = await api.get<Rover>(`/rovers/${id}`);
    return data;
  },

  async create(input: RoverInput): Promise<Rover> {
    const { data } = await api.post<Rover>('/rovers', input);
    return data;
  },

  async update(id: Id, input: Partial<RoverInput>): Promise<Rover> {
    const { data } = await api.put<Rover>(`/rovers/${id}`, input);
    return data;
  },

  async remove(id: Id): Promise<void> {
    await api.delete(`/rovers/${id}`);
  },
};
