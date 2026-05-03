import type { TextStyle } from 'react-native';

/**
 * System fonts until custom families are added.
 * Sizes follow a compact modular scale suitable for mobile.
 */
export const fontFamily = {
  sans: undefined as string | undefined,
  /** set when adding display font */
  display: undefined as string | undefined,
} as const;

export const fontWeight = {
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 40,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 44,
} as const;
