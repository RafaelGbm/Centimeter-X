import Constants from 'expo-constants';

const fromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

// Em dispositivo físico, troque para o IP da máquina na rede local (ex.: http://192.168.0.10:8080/api/v1).
export const API_BASE_URL = fromExtra ?? 'http://localhost:8080/api/v1';

export const REQUEST_TIMEOUT_MS = 15000;

// Modo de teste: usa dados simulados na memória, sem precisar do backend Spring Boot.
// Troque para false quando o backend estiver no ar.
export const USE_MOCK = true;

export const MOCK_CREDENTIALS = {
  email: 'teste@centimeter.com',
  password: 'teste1234',
};
