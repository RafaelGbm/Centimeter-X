import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { MOCK_CREDENTIALS } from '../config/env';
import type {
  BaseStation,
  CorrectionSession,
  DashboardSummary,
  Occurrence,
  Rover,
} from '../types/models';

const LATENCY_MS = 500;

const user = { id: 1, name: 'Operador Teste', email: MOCK_CREDENTIALS.email };

const stations: BaseStation[] = [
  { id: 1, code: 'BRAZ', name: 'Brasília IGS Station', latitude: -15.9475, longitude: -47.8779, online: true, constellations: ['GPS', 'GALILEO'], distanceKm: 12.4, lastProductUpdate: new Date().toISOString() },
  { id: 2, code: 'CHPI', name: 'Cachoeira Paulista', latitude: -22.6871, longitude: -45.0058, online: true, constellations: ['GPS', 'GALILEO'], distanceKm: 38.1, lastProductUpdate: new Date().toISOString() },
  { id: 3, code: 'POVE', name: 'Porto Velho', latitude: -8.7095, longitude: -63.8965, online: false, constellations: ['GPS'], distanceKm: 120.7 },
];

let rovers: Rover[] = [
  { id: 1, name: 'Trator John Deere 01', type: 'AGRICULTURAL', status: 'ACTIVE', baseStationId: 1, baseStation: stations[0], latitude: -15.8400, longitude: -47.8200, lastAccuracyCm: 1.8, lastSessionAt: new Date(Date.now() - 3600_000).toISOString(), createdAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
  { id: 2, name: 'Drone Mapper 02', type: 'DRONE', status: 'IDLE', baseStationId: 2, baseStation: stations[1], latitude: -22.5100, longitude: -44.8000, lastAccuracyCm: 2.4, lastSessionAt: new Date(Date.now() - 7200_000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400_000).toISOString() },
  { id: 3, name: 'Colheitadeira 03', type: 'AUTONOMOUS_VEHICLE', status: 'OFFLINE', baseStationId: 1, baseStation: stations[0], latitude: -16.0100, longitude: -47.9500, lastAccuracyCm: undefined, createdAt: new Date(Date.now() - 86400_000).toISOString() },
];

let sessions: CorrectionSession[] = [
  { id: 1, roverId: 1, baseStationId: 1, baseStationCode: 'BRAZ', constellation: 'GPS+GALILEO', fixStatus: 'FIX', horizontalAccuracyCm: 1.8, verticalAccuracyCm: 3.2, satellitesUsed: 14, correctionSource: 'IGS_RAPID', startedAt: new Date(Date.now() - 3600_000).toISOString() },
  { id: 2, roverId: 2, baseStationId: 2, baseStationCode: 'CHPI', constellation: 'GPS+GALILEO', fixStatus: 'FLOAT', horizontalAccuracyCm: 18.5, verticalAccuracyCm: 25.0, satellitesUsed: 9, correctionSource: 'IGS_ULTRA', startedAt: new Date(Date.now() - 7200_000).toISOString() },
];

let occurrences: Occurrence[] = [
  { id: 1, roverId: 1, type: 'SIGNAL_LOSS', description: 'Perda de fix próximo à mata', latitude: -15.9512, longitude: -47.8801, createdAt: new Date(Date.now() - 5400_000).toISOString() },
];

let seq = { rover: 100, session: 100, occurrence: 100 };

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse<T> {
  return { data, status, statusText: 'OK', headers: {}, config };
}

function fail(status: number, message: string): never {
  throw { response: { status, data: { status, message } } };
}

function page<T>(content: T[]) {
  return { content, page: 0, size: content.length, totalElements: content.length, totalPages: 1 };
}

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await new Promise((r) => setTimeout(r, LATENCY_MS));

  const method = (config.method ?? 'get').toLowerCase();
  const url = (config.url ?? '').replace(/^\/+/, '');
  const body = config.data ? JSON.parse(config.data as string) : {};

  // AUTH
  if (url === 'auth/login' && method === 'post') {
    if (body.email === MOCK_CREDENTIALS.email && body.password === MOCK_CREDENTIALS.password) {
      return ok({ accessToken: 'mock-access', refreshToken: 'mock-refresh', tokenType: 'Bearer', expiresIn: 900, user }, config);
    }
    fail(401, 'Credenciais inválidas.');
  }
  if (url === 'auth/register' && method === 'post') {
    return ok({ id: 2, name: body.name, email: body.email }, config, 201);
  }
  if (url === 'auth/refresh' && method === 'post') {
    return ok({ accessToken: 'mock-access', refreshToken: 'mock-refresh' }, config);
  }
  if (url === 'me' && method === 'get') {
    return ok(user, config);
  }

  // DASHBOARD
  if (url === 'dashboard' && method === 'get') {
    const summary: DashboardSummary = {
      activeRovers: rovers.filter((r) => r.status === 'ACTIVE').length,
      totalRovers: rovers.length,
      onlineBaseStations: stations.filter((s) => s.online).length,
      lastAccuracyCm: sessions[0]?.horizontalAccuracyCm,
      lastSessionAt: sessions[0]?.startedAt,
      recentOccurrences: occurrences.length,
    };
    return ok(summary, config);
  }

  // BASE STATIONS
  if (url === 'base-stations' && method === 'get') return ok(stations, config);
  const stationMatch = url.match(/^base-stations\/(\d+)$/);
  if (stationMatch && method === 'get') {
    const s = stations.find((x) => x.id === Number(stationMatch[1]));
    return s ? ok(s, config) : fail(404, 'Estação não encontrada.');
  }

  // ROVERS
  if (url.startsWith('rovers') && !url.includes('/sessions')) {
    const idMatch = url.match(/^rovers\/(\d+)$/);
    if (url === 'rovers' && method === 'get') return ok(page(rovers), config);
    if (url === 'rovers' && method === 'post') {
      const station = stations.find((s) => s.id === body.baseStationId);
      const rover: Rover = {
        id: ++seq.rover,
        name: body.name,
        type: body.type,
        status: 'IDLE',
        baseStationId: body.baseStationId,
        baseStation: station,
        latitude: station ? station.latitude + 0.08 : undefined,
        longitude: station ? station.longitude + 0.06 : undefined,
        createdAt: new Date().toISOString(),
      };
      rovers = [rover, ...rovers];
      return ok(rover, config, 201);
    }
    if (idMatch) {
      const id = Number(idMatch[1]);
      const rover = rovers.find((r) => r.id === id);
      if (!rover) fail(404, 'Rover não encontrado.');
      if (method === 'get') return ok(rover, config);
      if (method === 'put') {
        Object.assign(rover!, body);
        return ok(rover, config);
      }
      if (method === 'delete') {
        rovers = rovers.filter((r) => r.id !== id);
        return ok(null, config, 204);
      }
    }
  }

  // SESSIONS
  const startMatch = url.match(/^rovers\/(\d+)\/sessions$/);
  if (startMatch && method === 'post') {
    const roverId = Number(startMatch[1]);
    const rover = rovers.find((r) => r.id === roverId);
    if (!rover) fail(404, 'Rover não encontrado.');
    const station = stations.find((s) => s.id === rover!.baseStationId) ?? stations[0];
    const session: CorrectionSession = {
      id: ++seq.session,
      roverId,
      baseStationId: station.id,
      baseStationCode: station.code,
      constellation: 'GPS+GALILEO',
      fixStatus: 'FIX',
      horizontalAccuracyCm: randomBetween(1.2, 2.5),
      verticalAccuracyCm: randomBetween(2.5, 4.5),
      satellitesUsed: Math.floor(randomBetween(11, 16)),
      correctionSource: 'IGS_RAPID',
      startedAt: new Date().toISOString(),
    };
    sessions = [session, ...sessions];
    rover!.lastAccuracyCm = session.horizontalAccuracyCm;
    rover!.lastSessionAt = session.startedAt;
    rover!.status = 'ACTIVE';
    return ok(session, config, 201);
  }
  if (url === 'sessions' && method === 'get') return ok(page(sessions), config);
  const sessionMatch = url.match(/^sessions\/(\d+)$/);
  if (sessionMatch && method === 'get') {
    const s = sessions.find((x) => x.id === Number(sessionMatch[1]));
    return s ? ok(s, config) : fail(404, 'Sessão não encontrada.');
  }

  // OCCURRENCES
  if (url === 'occurrences' && method === 'get') return ok(page(occurrences), config);
  if (url === 'occurrences' && method === 'post') {
    // multipart: o campo "data" vem como JSON dentro do FormData
    let payload: Record<string, unknown> = {};
    const form = config.data as { _parts?: [string, unknown][] } | undefined;
    const dataPart = form?._parts?.find((p) => p[0] === 'data')?.[1];
    if (typeof dataPart === 'string') payload = JSON.parse(dataPart);
    const occ: Occurrence = {
      id: ++seq.occurrence,
      roverId: Number(payload.roverId),
      type: payload.type as Occurrence['type'],
      description: String(payload.description ?? ''),
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      createdAt: new Date().toISOString(),
    };
    occurrences = [occ, ...occurrences];
    return ok(occ, config, 201);
  }

  return fail(404, `Rota não mapeada no mock: ${method.toUpperCase()} /${url}`);
};
