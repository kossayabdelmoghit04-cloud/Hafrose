/**
 * HAFROSE Luxury Design System Tokens
 * Programmatic TypeScript constants for theme tokens, icons, animations, and design rules.
 */

export const HAFROSE_COLORS = {
  ROSE: {
    50: '#FDF7F8',
    100: '#FBF0F2',
    200: '#F6DFE4',
    300: '#EEBFCA',
    400: '#E297A9',
    500: '#D9778F', // Main Rose Accent
    600: '#C45772',
    700: '#A53E58',
    800: '#89344A',
    900: '#732F41',
  },
  BURGUNDY: {
    50: '#F8F1F3',
    100: '#F0E0E5',
    200: '#DFC2CB',
    300: '#C79BA9',
    400: '#AC6D81',
    500: '#8A1538', // Main Brand Burgundy
    600: '#7B1231',
    700: '#670E28',
    800: '#560E23', // Deep Luxury Burgundy
    900: '#480F20',
  },
  CREAM: {
    50: '#FFFFFF',
    100: '#FAF6F0', // Main Surface Cream
    200: '#F5EFEB', // Soft Ivory
    300: '#F0E8E1',
    400: '#E4D9CE',
  },
  GOLD: {
    50: '#FCFBF5',
    100: '#FAF6E6',
    500: '#D4AF37', // Champagne Gold
    700: '#93701E',
  },
  NEUTRAL: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
  SYSTEM: {
    SUCCESS: '#16A34A',
    WARNING: '#D97706',
    ERROR: '#DC2626',
    INFO: '#2563EB',
  },
} as const;

export const HAFROSE_TYPOGRAPHY = {
  FONTS: {
    SERIF: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif",
    SANS: "'Montserrat', 'Inter', system-ui, sans-serif",
  },
  LETTER_SPACING: {
    NORMAL: '0em',
    WIDE: '0.05em',
    LUXURY: '0.15em',
    LUXURY_WIDE: '0.25em',
  },
} as const;

export const HAFROSE_BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
  '3XL': 1920,
} as const;

export const HAFROSE_ANIMATIONS = {
  EASING: 'cubic-bezier(0.25, 1, 0.5, 1)',
  DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
  },
} as const;
