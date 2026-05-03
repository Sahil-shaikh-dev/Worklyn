/** Base radius (≈10px); derived sm/md/lg match shadcn-style curves */
const baseRadiusPx = 10;

export const radii = {
  none: 0,
  sm: 6,
  md: baseRadiusPx,
  lg: 14,
  xl: 18,
  full: 9999,
  /** canonical token for cards/buttons */
  base: baseRadiusPx,
} as const;

export type RadiiToken = keyof typeof radii;
