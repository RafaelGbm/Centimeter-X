import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT_MS, USE_MOCK } from '../config/env';
import { storage } from '../utils/storage';
import { mockAdapter } from './mockAdapter';

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(cb: () => void): void {
  onAuthFailure = cb;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  ...(USE_MOCK ? { adapter: mockAdapter } : {}),
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// Controla refresh concorrente: enquanto um refresh está em curso, as demais 401 aguardam.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await storage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    await storage.setAccessToken(data.accessToken);
    if (data.refreshToken) await storage.setRefreshToken(data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    const isAuthRoute = original?.url?.includes('/auth/');
    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        const headers = AxiosHeaders.from(original.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        original.headers = headers;
        return api(original);
      }
      await storage.clear();
      onAuthFailure?.();
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as
      | { message?: string; fieldErrors?: Record<string, string> }
      | undefined;
    return {
      status: error.response.status,
      message: data?.message ?? defaultMessage(error.response.status),
      fieldErrors: data?.fieldErrors,
    };
  }
  if (error.code === 'ECONNABORTED') {
    return { status: 0, message: 'Tempo de conexão esgotado. Tente novamente.' };
  }
  return { status: 0, message: 'Falha de conexão. Verifique sua internet.' };
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Dados inválidos.';
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Acesso não autorizado.';
    case 404:
      return 'Registro não encontrado.';
    case 409:
      return 'Conflito ao processar a solicitação.';
    default:
      return 'Erro inesperado. Tente novamente.';
  }
}
