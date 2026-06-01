import { File, Paths } from 'expo-file-system';
import { api } from './api';
import type { Id, Occurrence, OccurrenceType, Page } from '../types/models';

export interface OccurrenceInput {
  roverId: Id;
  type: OccurrenceType;
  description: string;
  latitude: number;
  longitude: number;
  photoUri: string;
}

export const occurrenceService = {
  async create(input: OccurrenceInput): Promise<Occurrence> {
    const form = new FormData();

    // O backend exige que a parte "data" seja application/json. O FormData do React
    // Native envia partes-string como text/plain (sem content-type), o que a API
    // rejeita com 415. Por isso gravamos o JSON num arquivo temporário e o anexamos
    // como parte de arquivo com type "application/json".
    const dataFile = new File(Paths.cache, `occurrence-data-${Date.now()}.json`);
    dataFile.create({ overwrite: true });
    dataFile.write(
      JSON.stringify({
        roverId: input.roverId,
        type: input.type,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
      }),
    );
    form.append('data', {
      uri: dataFile.uri,
      name: 'data.json',
      type: 'application/json',
    } as unknown as Blob);

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
    roverId?: Id;
    type?: OccurrenceType;
    page?: number;
    size?: number;
  }): Promise<Page<Occurrence>> {
    const { data } = await api.get<Page<Occurrence>>('/occurrences', { params });
    return data;
  },
};
