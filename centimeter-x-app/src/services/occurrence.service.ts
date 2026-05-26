import { api } from './api';
import type { Occurrence, OccurrenceType, Page } from '../types/models';

export interface OccurrenceInput {
  roverId: number;
  type: OccurrenceType;
  description: string;
  latitude: number;
  longitude: number;
  photoUri: string;
}

export const occurrenceService = {
  async create(input: OccurrenceInput): Promise<Occurrence> {
    const form = new FormData();
    form.append(
      'data',
      JSON.stringify({
        roverId: input.roverId,
        type: input.type,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
      }),
    );
    form.append('photo', {
      uri: input.photoUri,
      name: `occurrence-${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);

    const { data } = await api.post<Occurrence>('/occurrences', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async list(params?: {
    roverId?: number;
    type?: OccurrenceType;
    page?: number;
    size?: number;
  }): Promise<Page<Occurrence>> {
    const { data } = await api.get<Page<Occurrence>>('/occurrences', { params });
    return data;
  },
};
