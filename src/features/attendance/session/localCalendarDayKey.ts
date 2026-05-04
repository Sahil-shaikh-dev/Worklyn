/** Local calendar day string `YYYY-MM-DD` (lexicographic order matches chronological). */
export type DayKey = string;

/**
 * Stable local-calendar key for attendance day boundaries (`YYYY-MM-DD`).
 */
export function getLocalCalendarDayKey(d: Date): DayKey {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function startOfLocalCalendarDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addLocalCalendarDays(d: Date, deltaDays: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + deltaDays);
  return x;
}

/** Oldest `DayKey` kept in rolling history (today minus 30 calendar days). */
export function oldestRetainedAttendanceHistoryDayKey(now: Date): DayKey {
  const t0 = startOfLocalCalendarDay(now);
  const oldest = addLocalCalendarDays(t0, -30);
  return getLocalCalendarDayKey(oldest);
}
