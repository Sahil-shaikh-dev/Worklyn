import { formatHistorySelectedDateLabel } from '../src/pages/History/utils/formatHistorySelectedDateLabel';

describe('formatHistorySelectedDateLabel', () => {
  test('formats YYYY-MM-DD as short month with comma', () => {
    expect(formatHistorySelectedDateLabel('2026-05-03')).toBe('3 May, 2026');
    expect(formatHistorySelectedDateLabel('2026-01-01')).toBe('1 Jan, 2026');
  });

  test('returns original string when not parseable', () => {
    expect(formatHistorySelectedDateLabel('')).toBe('');
    expect(formatHistorySelectedDateLabel('bad')).toBe('bad');
  });
});
