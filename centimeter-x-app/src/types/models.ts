export type RoverType = 'AGRICULTURAL' | 'DRONE' | 'AUTONOMOUS_VEHICLE' | 'SURVEY';
export type RoverStatus = 'ACTIVE' | 'IDLE' | 'OFFLINE';
export type FixStatus = 'FIX' | 'FLOAT' | 'SINGLE';
export type CorrectionSource = 'IGS_FINAL' | 'IGS_RAPID' | 'IGS_ULTRA' | 'BROADCAST';
export type OccurrenceType = 'SIGNAL_LOSS' | 'DRIFT' | 'OBSTRUCTION' | 'OTHER';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface BaseStation {
  id: number;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  online: boolean;
  constellations: string[];
  distanceKm?: number;
  lastProductUpdate?: string;
}

export interface Rover {
  id: number;
  name: string;
  type: RoverType;
  status: RoverStatus;
  baseStationId?: number;
  baseStation?: BaseStation;
  latitude?: number;
  longitude?: number;
  lastAccuracyCm?: number;
  lastSessionAt?: string;
  createdAt?: string;
}

export interface CorrectionSession {
  id: number;
  roverId: number;
  baseStationId: number;
  baseStationCode?: string;
  constellation: string;
  fixStatus: FixStatus;
  horizontalAccuracyCm: number;
  verticalAccuracyCm: number;
  satellitesUsed: number;
  correctionSource: CorrectionSource;
  startedAt: string;
}

export interface Occurrence {
  id: number;
  roverId: number;
  type: OccurrenceType;
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  createdAt: string;
}

export interface DashboardSummary {
  activeRovers: number;
  totalRovers: number;
  onlineBaseStations: number;
  lastAccuracyCm?: number;
  lastSessionAt?: string;
  recentOccurrences: number;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
