import {
  buildTimelineRows,
  computeFooterSummary,
  computeTotals,
  formatDuration,
  formatShiftSessionDateLabel,
  pauseTotals,
  sortAttendanceEvents,
} from '../src/features/attendance';
import type { AttendanceEvent } from '../src/features/attendance';

describe('formatDuration', () => {
  it('returns 0m for non-positive', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(-1000)).toBe('0m');
  });

  it('formats minutes only', () => {
    expect(formatDuration(18 * 60_000)).toBe('18m');
  });

  it('formats hours only', () => {
    expect(formatDuration(2 * 60 * 60_000)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration((2 * 60 + 18) * 60_000)).toBe('2h 18m');
  });

  it('formats sub-minute and mixed minute-second', () => {
    expect(formatDuration(45_000)).toBe('45s');
    expect(formatDuration(90_000)).toBe('1m 30s');
    expect(formatDuration(8 * 60_000 + 30_000)).toBe('8m 30s');
  });

  it('formats hours with trailing seconds when non-zero', () => {
    expect(formatDuration(2 * 60 * 60_000 + 5_000)).toBe('2h 5s');
  });
});

describe('pauseTotals', () => {
  const now = new Date('2026-02-01T17:00:00');

  it('sums completed pause intervals', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: '2', type: 'pause_started', at: new Date('2026-02-01T12:00:00') },
      { id: '3', type: 'pause_ended', at: new Date('2026-02-01T12:18:00') },
    ];
    const sorted = sortAttendanceEvents(events);
    const { ms, hasOpenPause } = pauseTotals(sorted, now);
    expect(hasOpenPause).toBe(false);
    expect(ms).toBe(18 * 60_000);
  });

  it('includes open pause through asOf', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: '2', type: 'pause_started', at: new Date('2026-02-01T12:00:00') },
      { id: '3', type: 'pause_ended', at: new Date('2026-02-01T12:18:00') },
      { id: '4', type: 'pause_started', at: new Date('2026-02-01T15:00:00') },
    ];
    const sorted = sortAttendanceEvents(events);
    const { ms, hasOpenPause } = pauseTotals(sorted, now);
    expect(hasOpenPause).toBe(true);
    // 18m + (17:00 - 15:00) = 18m + 2h
    expect(ms).toBe(18 * 60_000 + 2 * 60 * 60_000);
  });
});

describe('computeTotals', () => {
  const now = new Date('2026-02-01T17:00:00');

  it('computes shift span and active work with open shift', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: '2', type: 'pause_started', at: new Date('2026-02-01T12:00:00') },
      { id: '3', type: 'pause_ended', at: new Date('2026-02-01T12:18:00') },
      { id: '4', type: 'pause_started', at: new Date('2026-02-01T15:00:00') },
    ];
    const sorted = sortAttendanceEvents(events);
    const t = computeTotals(sorted, now);
    expect(t.shiftSpanMs).toBe(8 * 60 * 60_000);
    expect(t.totalPausedMs).toBe(18 * 60_000 + 2 * 60 * 60_000);
    expect(t.activeWorkedMs).toBe(t.shiftSpanMs - t.totalPausedMs);
    expect(t.hasOpenPause).toBe(true);
  });

  it('keeps cumulative day totals when idle after clock out', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: '2', type: 'clock_out', at: new Date('2026-02-01T18:00:00') },
    ];
    const sorted = sortAttendanceEvents(events);
    const t = computeTotals(sorted, new Date('2026-02-01T23:00:00'));
    expect(t.shiftSpanMs).toBe(9 * 60 * 60_000);
    expect(t.activeWorkedMs).toBe(9 * 60 * 60_000);
    expect(t.hasOpenPause).toBe(false);
  });

  it('sums all segments for the business day', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: '2', type: 'clock_out', at: new Date('2026-02-01T12:00:00') },
      { id: '3', type: 'clock_in', at: new Date('2026-02-01T13:00:00') },
      { id: '4', type: 'clock_out', at: new Date('2026-02-01T18:00:00') },
      { id: '5', type: 'clock_in', at: new Date('2026-02-01T19:00:00') },
    ];
    const sorted = sortAttendanceEvents(events);
    const t = computeTotals(sorted, new Date('2026-02-01T23:00:00'));
    expect(t.shiftSpanMs).toBe(3 * 60 * 60_000 + 5 * 60 * 60_000 + 4 * 60 * 60_000);
    expect(t.hasOpenPause).toBe(false);
  });
});

describe('computeFooterSummary', () => {
  it('returns null without clock in', () => {
    expect(
      computeFooterSummary(
        [{ id: 'x', type: 'pause_started', at: new Date() }],
        new Date(),
      ),
    ).toBeNull();
  });

  it('still shows footer when idle after clock out', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: '2', type: 'clock_out', at: new Date('2026-02-01T10:00:00') },
    ];
    const s = computeFooterSummary(events, new Date('2026-02-01T11:00:00'));
    expect(s).not.toBeNull();
    expect(s!.usesProvisionalEnd).toBe(false);
    expect(s!.activeWorkedMs).toBe(60 * 60_000);
  });

  it('flags provisional end when no clock out', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
    ];
    const s = computeFooterSummary(events, new Date('2026-02-01T10:00:00'));
    expect(s).not.toBeNull();
    expect(s!.usesProvisionalEnd).toBe(true);
  });
});

describe('buildTimelineRows', () => {
  const now = new Date('2026-02-01T17:00:00');

  it('lists completed shifts on the same calendar day', () => {
    const events: AttendanceEvent[] = [
      { id: 'a', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: 'b', type: 'clock_out', at: new Date('2026-02-01T10:00:00') },
    ];
    const rows = buildTimelineRows(events, now);
    expect(rows).toHaveLength(2);
    expect(rows[0].kind).toBe('clock_in');
    expect(rows[1].kind).toBe('clock_out');
  });

  it('marks first and last rows for open shift', () => {
    const events: AttendanceEvent[] = [
      { id: 'a', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: 'b', type: 'pause_started', at: new Date('2026-02-01T10:00:00') },
    ];
    const rows = buildTimelineRows(events, now);
    expect(rows).toHaveLength(2);
    expect(rows[0].isFirst).toBe(true);
    expect(rows[0].isLast).toBe(false);
    expect(rows[1].isLast).toBe(true);
  });

  it('omits per-row date headings (date lives on clock card)', () => {
    const events: AttendanceEvent[] = [
      { id: 'a', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: 'b', type: 'pause_started', at: new Date('2026-02-01T10:00:00') },
    ];
    const rows = buildTimelineRows(events, now);
    expect(rows.every(r => r.dateHeading === '')).toBe(true);
  });
});

describe('formatShiftSessionDateLabel', () => {
  it('formats first clock-in date', () => {
    const events: AttendanceEvent[] = [
      { id: 'a', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
    ];
    const label = formatShiftSessionDateLabel(events);
    expect(label.length).toBeGreaterThan(0);
  });

  it('uses first clock-in date for the business day', () => {
    const events: AttendanceEvent[] = [
      { id: 'a', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
      { id: 'b', type: 'clock_out', at: new Date('2026-02-01T10:00:00') },
      { id: 'c', type: 'clock_in', at: new Date('2026-02-01T13:00:00') },
    ];
    const label = formatShiftSessionDateLabel(events);
    expect(label).toBe(formatShiftSessionDateLabel([events[0]]));
  });

  it('returns empty string when no clock in', () => {
    expect(
      formatShiftSessionDateLabel([
        { id: 'x', type: 'pause_started', at: new Date() },
      ]),
    ).toBe('');
  });
});
