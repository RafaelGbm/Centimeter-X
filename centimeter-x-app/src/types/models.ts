export type RoverType = 'AGRICULTURAL' | 'DRONE' | 'AUTONOMOUS_VEHICLE' | 'SURVEY';
export type RoverStatus = 'ACTIVE' | 'IDLE' | 'OFFLINE';
export type FixStatus = 'FIX' | 'FLOAT' | 'SINGLE';
export type CorrectionSource = 'IGS_FINAL' | 'IGS_RAPID' | 'IGS_ULTRA' | 'BROADCAST';
export type OccurrenceType = 'SIGNAL_LOSS' | 'DRIFT' | 'OBSTRUCTION' | 'OTHER';

// IDs são UUIDs (string) gerados pela API. Em modo mock também são strings.
export type Id = string;

export interface User {
  id: Id;
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
  id: Id;
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
  id: Id;
  name: string;
  type: RoverType;
  status: RoverStatus;
  baseStationId?: Id;
  baseStation?: BaseStation;
  latitude?: number;
  longitude?: number;
  lastAccuracyCm?: number;
  lastSessionAt?: string;
  createdAt?: string;
}

export interface CorrectionSession {
  id: Id;
  roverId: Id;
  baseStationId: Id;
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
  id: Id;
  roverId: Id;
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
