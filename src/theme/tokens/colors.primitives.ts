/**
 * HSL strings (space-separated) for RN + Unistyles processColor.
 * Neutrals: cool gray with a bluish-teal cast; pairs with brand on dark UI.
 */
export const neutral = {
  n950: '204 16% 9%',
  n900: '204 14% 12%',
  n850: '204 12% 14%',
  n800: '204 11% 17%',
  n700: '204 10% 22%',
  n600: '204 9% 34%',
  n500: '204 8% 46%',
  n400: '204 8% 58%',
  n300: '204 9% 70%',
  n100: '204 11% 96%',
  n50: '204 13% 98%',
} as const;

/**
 * Bluish teal primary (hue ~194°): cyan-teal, not green-teal.
 */
export const brand = {
  b950: '198 44% 10%',
  b600: '192 54% 46%',
  b500: '194 56% 51%',
  b400: '196 52% 60%',
  b300: '198 48% 70%',
} as const;

export const red = {
  destructive: '0 62% 50%',
  destructiveFg: '0 0% 98%',
} as const;
