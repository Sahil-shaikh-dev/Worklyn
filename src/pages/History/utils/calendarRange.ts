import { getLocalCalendarDayKey } from '../../../features/attendance/session/localCalendarDayKey';

/** Days strictly before today in the strip (today + 30 prior). */
export const HISTORY_STRIP_PAST_DAYS = 30;
/** Trailing placeholder days after today (visible but not selectable). */
export const HISTORY_STRIP_FUTURE_DAYS = 5;
/** Total cells: prior + today + future placeholders. */
export const HISTORY_STRIP_LENGTH =
  HISTORY_STRIP_PAST_DAYS + 1 + HISTORY_STRIP_FUTURE_DAYS;

/** How many day cells are visible at once in the strip. */
export const HISTORY_STRIP_VISIBLE_DAYS = 7;

/** Index of "today" in the strip when data[0] === today - 30. */
export const HISTORY_STRIP_TODAY_INDEX = HISTORY_STRIP_PAST_DAYS;

/**
 * First visible index when "today" is centered in a 7-wide window (when possible).
 */
export const HISTORY_STRIP_INITIAL_SCROLL_INDEX = Math.max(
  0,
  HISTORY_STRIP_TODAY_INDEX - 3,
);

/** First scroll index so `dayIndex` appears centered in a 7-wide window (when possible). */
export function firstIndexToCenterDay(dayIndex: number): number {
  const maxFirst = Math.max(
    0,
    HISTORY_STRIP_LENGTH - HISTORY_STRIP_VISIBLE_DAYS,
  );
  const half = Math.floor(HISTORY_STRIP_VISIBLE_DAYS / 2);
  return Math.max(0, Math.min(maxFirst, dayIndex - half));
}

export function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addLocalDays(d: Date, deltaDays: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + deltaDays);
  return x;
}

/** @deprecated Use getLocalCalendarDayKey from attendance session (same format). */
export function formatDayKey(d: Date): string {
  return getLocalCalendarDayKey(d);
}

export function parseDayKey(key: string): Date {
  const [ys, ms, ds] = key.split('-');
  const y = Number(ys);
  const mo = Number(ms) - 1;
  const day = Number(ds);
  return startOfLocalDay(new Date(y, mo, day));
}

export type DayStripItem = Readonly<{
  id: string;
  date: Date;
  dayKey: string;
  labelWeekday: string;
  labelDay: string;
  isToday: boolean;
  /** Future calendar days — shown for scroll range but not tappable. */
  isDisabled: boolean;
}>;

const weekdayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const dayNumFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric' });

export function buildDayStripItems(anchorNow: Date = new Date()): DayStripItem[] {
  const todayStart = startOfLocalDay(anchorNow);
  const todayKey = getLocalCalendarDayKey(todayStart);
  const start = addLocalDays(todayStart, -HISTORY_STRIP_PAST_DAYS);
  const items: DayStripItem[] = [];
  for (let i = 0; i < HISTORY_STRIP_LENGTH; i += 1) {
    const date = addLocalDays(start, i);
    const dayKey = getLocalCalendarDayKey(date);
    const isFuture = dayKey > todayKey;
    items.push({
      id: dayKey,
      date,
      dayKey,
      labelWeekday: weekdayFmt.format(date),
      labelDay: dayNumFmt.format(date),
      isToday: dayKey === todayKey,
      isDisabled: isFuture,
    });
  }
  return items;
}
