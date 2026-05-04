import {
  buildDayStripItems,
  firstIndexToCenterDay,
  formatDayKey,
  HISTORY_STRIP_INITIAL_SCROLL_INDEX,
  HISTORY_STRIP_LENGTH,
  HISTORY_STRIP_TODAY_INDEX,
  startOfLocalDay,
} from '../src/pages/History/utils/calendarRange';

describe('historyCalendarRange', () => {
  test('strip length is 36 days (30 prior + today + 5 future placeholders)', () => {
    expect(HISTORY_STRIP_LENGTH).toBe(36);
    expect(HISTORY_STRIP_TODAY_INDEX).toBe(30);
  });

  test('initial scroll index centers today in a 7-wide window', () => {
    expect(HISTORY_STRIP_INITIAL_SCROLL_INDEX).toBe(27);
  });

  test('firstIndexToCenterDay clamps at range ends', () => {
    expect(firstIndexToCenterDay(0)).toBe(0);
    expect(firstIndexToCenterDay(2)).toBe(0);
    expect(firstIndexToCenterDay(30)).toBe(27);
    expect(firstIndexToCenterDay(29)).toBe(26);
    expect(firstIndexToCenterDay(35)).toBe(29);
  });

  test('buildDayStripItems marks today, future disabled, and contiguous keys', () => {
    const anchor = new Date(2026, 4, 4, 15, 30, 0);
    const items = buildDayStripItems(anchor);
    expect(items).toHaveLength(HISTORY_STRIP_LENGTH);
    const todayItem = items[HISTORY_STRIP_TODAY_INDEX];
    expect(todayItem?.isToday).toBe(true);
    expect(todayItem?.isDisabled).toBe(false);
    expect(todayItem?.dayKey).toBe(formatDayKey(startOfLocalDay(anchor)));
    expect(items[0]?.dayKey).toBe(
      formatDayKey(startOfLocalDay(new Date(2026, 3, 4, 0, 0, 0))),
    );
    expect(items[0]?.isDisabled).toBe(false);
    expect(items[31]?.isDisabled).toBe(true);
    expect(items[35]?.isDisabled).toBe(true);
  });
});
