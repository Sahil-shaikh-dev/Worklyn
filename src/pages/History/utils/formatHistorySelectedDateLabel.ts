const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Human-readable label for a `YYYY-MM-DD` local day key (e.g. `3 May, 2026`).
 */
export function formatHistorySelectedDateLabel(dayKey: string): string {
  const parts = dayKey.split('-');
  if (parts.length !== 3) {
    return dayKey;
  }
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const day = Number(parts[2]);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(day) ||
    m < 1 ||
    m > 12 ||
    day < 1 ||
    day > 31
  ) {
    return dayKey;
  }
  const monthLabel = MONTH_SHORT[m - 1];
  if (monthLabel == null) {
    return dayKey;
  }
  return `${day} ${monthLabel}, ${y}`;
}
