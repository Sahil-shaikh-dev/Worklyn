/**
 * HSL strings (space-separated) for RN + Unistyles processColor.
 * Neutrals: zinc-adjacent; brand: muted teal for dark UI.
 */
export const neutral = {
  n950: '240 10% 9%',
  n900: '240 8% 12%',
  n850: '240 7% 14%',
  n800: '240 6% 17%',
  n700: '240 5% 22%',
  n600: '240 5% 34%',
  n500: '240 4% 46%',
  n400: '240 4% 58%',
  n300: '240 5% 70%',
  n100: '0 0% 96%',
  n50: '0 0% 98%',
} as const;

/**
 * Muted teal between blue and green: calm on zinc neutrals, not pool-toy cyan.
 * Hue ~188–192° reads “trust / product” without fighting cool gray surfaces.
 */
export const brand = {
  b950: '192 40% 10%',
  b600: '190 42% 42%',
  b500: '190 46% 48%',
  b400: '191 50% 56%',
  b300: '192 52% 64%',
} as const;

export const red = {
  destructive: '0 62% 50%',
  destructiveFg: '0 0% 98%',
} as const;
