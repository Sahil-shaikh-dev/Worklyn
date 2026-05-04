import {
  dateFormatMedium,
  timeFormatHms12h,
} from '../../constants/dateTime';

export function formatDateHeading(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { ...dateFormatMedium }).format(d);
}

export function formatTimePrecise(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { ...timeFormatHms12h }).format(d);
}

/**
 * Human-readable duration (hours / minutes / seconds).
 * Sub-minute pauses are shown as `45s` or `1m 30s`, so totals match the underlying ms
 * (the old minute-only floor hid short breaks as `0m` while footers still summed them).
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) {
    return '0m';
  }
  if (ms < 1000) {
    return '<1s';
  }
  const secTotal = Math.floor(ms / 1000);
  const h = Math.floor(secTotal / 3600);
  const m = Math.floor((secTotal % 3600) / 60);
  const s = secTotal % 60;

  if (h > 0) {
    const parts: string[] = [`${h}h`];
    if (m > 0) {
      parts.push(`${m}m`);
    }
    if (s > 0) {
      parts.push(`${s}s`);
    }
    return parts.join(' ');
  }
  if (m > 0) {
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  return `${s}s`;
}
