// LifeLens Design System — Monochrome base + functional color accents
// Blue = primary action. Red = danger/high-severity. Yellow = caution. No decoration.

// ─── SPACING (fixed scale, nothing else) ───
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,

  // Legacy aliases
  xxl: 24,
  xxxl: 32,
};

// ─── RADIUS (two values only) ───
export const radius = {
  sm: 8,   // inputs, chips, small elements
  md: 12,  // cards, containers
  // Legacy
  chip: 8,
  button: 8,
  card: 12,
};

// Legacy alias
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 12,
  xl: 12,
  full: 999,
};

// ─── SHADOWS (minimal, near-imperceptible) ───
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

// ─── COLORS ───
export const colors = {
  // Surfaces
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Primary — blue, for actions only
  primary: '#1D4ED8',
  primaryMuted: '#EFF6FF',
  primaryLight: '#EFF6FF',
  primaryDark: '#1E40AF',

  // Semantic — each has ONE job
  danger: '#DC2626',
  dangerMuted: '#FEF2F2',
  warning: '#D97706',
  warningMuted: '#FFFBEB',
  success: '#15803D',
  successMuted: '#F0FDF4',

  // Text
  text: '#0A0A0B',
  textSecondary: '#6B6B70',
  textTertiary: '#A0A0A5',

  // Borders
  border: '#E4E4E7',
  borderLight: '#E4E4E7',

  // Legacy aliases (mapped to new system)
  accent: '#1D4ED8',
  accentMuted: '#EFF6FF',
  secondary: '#15803D',

  // Severity
  severity: {
    low: '#15803D',
    moderate: '#D97706',
    high: '#DC2626',
    critical: '#DC2626',
  },

  // Gradients (removed — only keep for backward compat, use sparingly)
  gradient: {
    primary: ['#1D4ED8', '#1E40AF'] as [string, string],
    hero: ['#1D4ED8', '#1E40AF'] as [string, string],
    soft: ['#FAFAFA', '#F5F5F6'] as [string, string],
    warm: ['#FAFAFA', '#FAFAFA'] as [string, string],
    health: ['#15803D', '#15803D'] as [string, string],
    purple: ['#1D4ED8', '#1D4ED8'] as [string, string],
  },

  shadow: '#000000',
};

// ─── TYPOGRAPHY ───
export const typography = {
  // Design system scale
  display: { fontSize: 48, fontWeight: '700' as const, lineHeight: 52 },
  screenTitle: { fontSize: 24, fontWeight: '600' as const, lineHeight: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  cardTitle: { fontSize: 15, fontWeight: '500' as const, lineHeight: 20 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodyMedium: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  meta: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },

  // Legacy aliases
  h1: { fontSize: 24, fontWeight: '600' as const, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  bodyBold: { fontSize: 15, fontWeight: '500' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

const theme = { spacing, radius, borderRadius, shadows, colors, typography };
export default theme;
