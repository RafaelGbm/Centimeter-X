import Constants from 'expo-constants';

const fromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

// Em dispositivo físico, troque para o IP da máquina na rede local (ex.: http://192.168.0.10:8080/api/v1).
export const API_BASE_URL = fromExtra ?? 'http://localhost:8080/api/v1';

export const REQUEST_TIMEOUT_MS = 15000;

// Modo de teste: usa dados simulados na memória, sem precisar do backend Spring Boot.
// Troque para false quando o backend estiver no ar.
//
// Ao apontar para o backend real (USE_MOCK = false):
//  1. Ajuste `extra.apiBaseUrl` em app.json para o IP da máquina na rede local
//     (ex.: http://192.168.0.10:8080/api/v1) — em device físico, localhost não funciona.
//  2. Garanta que esse IP/origem esteja no CORS do backend (security.cors.allowed-origins).
//  3. Use uma conta do seed da API: operador@centimeterx.com (senha em app.seed.demo-password,
//     padrão Centimeter@2026) ou cadastre uma nova pela tela de registro.
export const USE_MOCK = false;

// Credenciais pré-preenchidas pelo box "Modo de teste" (só aparece quando USE_MOCK = true).
export const MOCK_CREDENTIALS = {
  email: 'teste@centimeter.com',
  password: 'teste1234',
};
