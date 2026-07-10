// LifeLens Design System — Medical Precision: Sharp, Structured, Apple Health / Linear grade
// Typography: DM Serif Display (headings/numbers) + Inter (body/UI)

export const colors = {
  // Backgrounds
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSunken: '#F1F3F5',

  // Text
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border
  border: '#E5E7EB',

  // Coral (primary accent)
  coral: '#EF4444',
  coralSoft: '#FEE2E2',

  // Amber
  amber: '#F59E0B',

  // Sage (success/health)
  sage: '#10B981',

  // Danger
  danger: '#DC2626',

  // Severity
  severity: {
    low: '#10B981',
    moderate: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626',
  },

  // Gradients
  gradient: {
    orb: ['#EF4444', '#F59E0B', '#10B981'] as [string, string, string],
    orbGlow: ['rgba(239,68,68,0.25)', 'rgba(239,68,68,0)'] as [string, string],
    coralAmber: ['#EF4444', '#F59E0B'] as [string, string],
    fadeBottom: ['transparent', '#F8F9FA'] as [string, string],
    hero: ['#EF4444', '#F59E0B'] as [string, string],
    primary: ['#EF4444', '#DC2626'] as [string, string],
  },

  // Misc
  shadow: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',

  // Legacy aliases
  primary: '#EF4444',
  primaryMuted: '#FEE2E2',
  success: '#10B981',
  successMuted: '#D1FAE5',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  dangerMuted: '#FEE2E2',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F1F3F5',
  borderLight: '#E5E7EB',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;

export const borderRadius = radius;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabBar: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
} as const;

export const fonts = {
  fraunces: {
    regular: 'Geist-Regular',
    medium: 'Geist-Medium',
    semiBold: 'Geist-SemiBold',
    bold: 'Geist-Bold',
  },
  generalSans: {
    regular: 'Geist-Regular',
    medium: 'Geist-Medium',
    semiBold: 'Geist-SemiBold',
    bold: 'Geist-Bold',
  },
} as const;

export const typography = {
  // New tokens
  displayHero: { fontFamily: fonts.fraunces.semiBold, fontSize: 28, letterSpacing: -0.3 },
  h1: { fontFamily: fonts.fraunces.semiBold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.fraunces.semiBold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.fraunces.semiBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.generalSans.regular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fonts.generalSans.medium, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.generalSans.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.generalSans.regular, fontSize: 13, lineHeight: 18 },
  captionMedium: { fontFamily: fonts.generalSans.medium, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: fonts.generalSans.semiBold, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  tiny: { fontFamily: fonts.generalSans.regular, fontSize: 11, lineHeight: 14 },
  tinyMedium: { fontFamily: fonts.generalSans.medium, fontSize: 11, lineHeight: 14 },
  // Legacy aliases
  screenTitle: { fontFamily: fonts.fraunces.semiBold, fontSize: 28, lineHeight: 34 },
  sectionTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, lineHeight: 22 },
  cardTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 15, lineHeight: 22 },
  meta: { fontFamily: fonts.generalSans.medium, fontSize: 12, lineHeight: 16 },
} as const;

export const motion = {
  stagger: 60,
  enterDuration: 220,
  enterTranslateY: 8,
  orbBreathDuration: 2400,
  orbPulseDuration: 1600,
  pressScale: 0.98,
} as const;

const theme = { colors, spacing, radius, shadows, fonts, typography, motion };
export type Theme = typeof theme;
export default theme;
