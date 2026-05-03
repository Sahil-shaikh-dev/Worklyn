/**
 * Stable local-calendar key for attendance day boundaries (`YYYY-MM-DD`).
 */
export function getLocalCalendarDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
