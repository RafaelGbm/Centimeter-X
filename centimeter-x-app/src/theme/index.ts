import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  // Fundo (degradê espacial)
  bgTop: '#0A1730',
  bgBottom: '#0E2347',
  background: '#0A1730',

  // Superfícies
  surface: '#13294B',
  surfaceAlt: '#1B385F',
  surfaceElevated: '#1E3E69',

  // Marca
  primary: '#3BA0FF',
  primaryDark: '#1B6FCC',
  accent: '#2FF0C2',
  accentDark: '#16B894',

  // Texto
  text: '#F4F8FF',
  textMuted: '#9DB2CE',
  textFaint: '#6B82A3',

  // Bordas / divisores
  border: '#26456F',
  borderSoft: '#1C3556',

  // Semânticos
  danger: '#FF5C7A',
  warning: '#FFC062',
  success: '#2FF0C2',

  white: '#FFFFFF',
  overlay: 'rgba(5, 14, 30, 0.6)',
} as const;

export const gradients = {
  background: ['#0A1730', '#0E2347', '#10182E'] as const,
  primary: ['#3BA0FF', '#1B6FCC'] as const,
  accent: ['#2FF0C2', '#16B894'] as const,
  hero: ['#1B385F', '#13294B'] as const,
  precision: ['#2FF0C2', '#3BA0FF'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  display: 44,
} as const;

export const typography = {
  display: { fontSize: fontSize.display, fontWeight: '800', letterSpacing: -0.5 } as TextStyle,
  h1: { fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.3 } as TextStyle,
  h2: { fontSize: fontSize.xl, fontWeight: '800' } as TextStyle,
  h3: { fontSize: fontSize.lg, fontWeight: '700' } as TextStyle,
  body: { fontSize: fontSize.md, fontWeight: '500' } as TextStyle,
  label: { fontSize: fontSize.sm, fontWeight: '600' } as TextStyle,
  caption: { fontSize: fontSize.xs, fontWeight: '600' } as TextStyle,
} as const;

export const shadow = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
  glow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.accent,
      shadowOpacity: 0.5,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
    },
    android: { elevation: 10 },
    default: {},
  }) as ViewStyle,
} as const;
