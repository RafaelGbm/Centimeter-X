import type { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type {
  FixStatus,
  OccurrenceType,
  RoverStatus,
  RoverType,
} from '../types/models';

type IconName = keyof typeof Ionicons.glyphMap;

export const roverTypeIcon: Record<RoverType, IconName> = {
  AGRICULTURAL: 'leaf',
  DRONE: 'navigate',
  AUTONOMOUS_VEHICLE: 'car-sport',
  SURVEY: 'map',
};

export const occurrenceTypeIcon: Record<OccurrenceType, IconName> = {
  SIGNAL_LOSS: 'cellular',
  DRIFT: 'git-compare',
  OBSTRUCTION: 'warning',
  OTHER: 'ellipsis-horizontal-circle',
};

export const roverTypeLabel: Record<RoverType, string> = {
  AGRICULTURAL: 'Agrícola',
  DRONE: 'Drone',
  AUTONOMOUS_VEHICLE: 'Veículo autônomo',
  SURVEY: 'Topografia',
};

export const roverStatusLabel: Record<RoverStatus, string> = {
  ACTIVE: 'Ativo',
  IDLE: 'Ocioso',
  OFFLINE: 'Offline',
};

export const roverStatusColor: Record<RoverStatus, string> = {
  ACTIVE: colors.success,
  IDLE: colors.warning,
  OFFLINE: colors.textMuted,
};

export const fixStatusLabel: Record<FixStatus, string> = {
  FIX: 'FIX (centímetros)',
  FLOAT: 'FLOAT (decímetros)',
  SINGLE: 'SINGLE (metros)',
};

export const fixStatusColor: Record<FixStatus, string> = {
  FIX: colors.success,
  FLOAT: colors.warning,
  SINGLE: colors.danger,
};

export const occurrenceTypeLabel: Record<OccurrenceType, string> = {
  SIGNAL_LOSS: 'Perda de sinal',
  DRIFT: 'Deriva',
  OBSTRUCTION: 'Obstrução',
  OTHER: 'Outro',
};

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAccuracy(cm?: number): string {
  if (cm == null) return '—';
  return `${cm.toFixed(1)} cm`;
}
