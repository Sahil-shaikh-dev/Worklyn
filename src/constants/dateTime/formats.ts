/**
 * Intl.DateTimeFormat option presets for consistent time/date display app-wide.
 * Wall-clock times (e.g. timeline, history) use 12-hour via `timeFormatHms12h` in `formatTimePrecise`.
 * Elapsed durations use `formatElapsedAsHms` (H:MM:SS), not these presets.
 */
export const timeFormatHms12h = {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
} as const satisfies Intl.DateTimeFormatOptions;

export const timeFormatHms24h = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
} as const satisfies Intl.DateTimeFormatOptions;

export const timeFormatHm24h = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
} as const satisfies Intl.DateTimeFormatOptions;

export const dateFormatMedium = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
} as const satisfies Intl.DateTimeFormatOptions;
