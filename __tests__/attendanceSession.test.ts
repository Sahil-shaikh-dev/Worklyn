import { applyAttendanceAction } from '../src/features/attendance/session/applyAttendanceAction';
import type { AttendanceSessionSnapshot } from '../src/features/attendance/session/attendanceSessionTypes';
import { deriveSessionPhase } from '../src/features/attendance/session/deriveSessionPhase';
import {
  getActiveWorkedMs,
  getCurrentPauseElapsedMs,
  getShiftDurations,
} from '../src/features/attendance/session/sessionDurations';
import { getLocalCalendarDayKey } from '../src/features/attendance/session/localCalendarDayKey';
import { resolveSnapshotForCalendarDay } from '../src/features/attendance/session/resolveSnapshotForCalendarDay';
import type { AttendanceEvent } from '../src/features/attendance/types';

const t0 = (iso: string) => new Date(iso);

describe('deriveSessionPhase', () => {
  it('idle when empty', () => {
    expect(deriveSessionPhase([])).toBe('idle');
  });

  it('working after clock in', () => {
    expect(
      deriveSessionPhase([
        { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
      ]),
    ).toBe('working');
  });

  it('paused after pause_started', () => {
    expect(
      deriveSessionPhase([
        { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
        { id: '2', type: 'pause_started', at: t0('2026-02-01T10:00:00') },
      ]),
    ).toBe('paused');
  });

  it('idle after clock out', () => {
    expect(
      deriveSessionPhase([
        { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
        { id: '2', type: 'clock_out', at: t0('2026-02-01T11:00:00') },
      ]),
    ).toBe('idle');
  });
});

describe('applyAttendanceAction', () => {
  const empty = {
    events: [],
    updatedAt: t0('2026-01-01T00:00:00'),
    businessDayKey: null as string | null,
  };

  it('clock in when idle sets businessDayKey from clock-in instant (local calendar)', () => {
    const now = t0('2026-02-01T09:00:00');
    const r = applyAttendanceAction(empty, { type: 'clock_in' }, now);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.snapshot.events).toHaveLength(1);
      expect(r.snapshot.events[0].type).toBe('clock_in');
      expect(r.snapshot.businessDayKey).toBe(getLocalCalendarDayKey(now));
    }
  });

  it('rejects second clock in', () => {
    const now = t0('2026-02-01T09:00:00');
    const s1 = applyAttendanceAction(empty, { type: 'clock_in' }, now);
    expect(s1.ok).toBe(true);
    if (!s1.ok) {
      return;
    }
    const r = applyAttendanceAction(s1.snapshot, { type: 'clock_in' }, now);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe('ALREADY_CLOCKED_IN');
    }
  });

  it('pause only when working', () => {
    const r = applyAttendanceAction(empty, { type: 'start_pause' }, t0('2026-02-01T09:00:00'));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe('INVALID_PHASE');
    }
  });

  it('resume only when paused', () => {
    const now = t0('2026-02-01T09:00:00');
    const s1 = applyAttendanceAction(empty, { type: 'clock_in' }, now);
    expect(s1.ok).toBe(true);
    if (!s1.ok) {
      return;
    }
    const r = applyAttendanceAction(s1.snapshot, { type: 'end_pause' }, now);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe('NOT_PAUSED');
    }
  });

  it('rejects clock out while paused', () => {
    const s: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
      { id: '2', type: 'pause_started', at: t0('2026-02-01T10:00:00') },
    ];
    const snap = {
      events: s,
      updatedAt: t0('2026-02-01T10:00:00'),
      businessDayKey: '2026-02-01',
    };
    const r = applyAttendanceAction(snap, { type: 'clock_out' }, t0('2026-02-01T11:00:00'));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe('CLOCK_OUT_WHILE_PAUSED');
    }
  });

  it('full pause cycle', () => {
    let snap: AttendanceSessionSnapshot = empty;
    const n = (d: string) => t0(d);
    const steps: Array<{ a: 'clock_in' | 'start_pause' | 'end_pause' | 'clock_out'; t: string }> = [
      { a: 'clock_in', t: '2026-02-01T09:00:00' },
      { a: 'start_pause', t: '2026-02-01T12:00:00' },
      { a: 'end_pause', t: '2026-02-01T12:18:00' },
      { a: 'clock_out', t: '2026-02-01T17:00:00' },
    ];
    for (const { a, t } of steps) {
      const r = applyAttendanceAction(snap, { type: a }, n(t));
      expect(r.ok).toBe(true);
      if (r.ok) {
        snap = r.snapshot;
      }
    }
    expect(snap.events).toHaveLength(4);
    expect(deriveSessionPhase(snap.events)).toBe('idle');
  });
});

describe('sessionDurations', () => {
  it('active work flat during open pause', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
      { id: '2', type: 'pause_started', at: t0('2026-02-01T12:00:00') },
    ];
    const atPause = t0('2026-02-01T12:30:00');
    const w1 = getActiveWorkedMs(events, atPause);
    const w0 = getActiveWorkedMs(events, t0('2026-02-01T12:00:00'));
    expect(w1).toBe(w0);
    expect(getCurrentPauseElapsedMs(events, atPause)).toBe(30 * 60_000);
  });

  it('getShiftDurations matches open shift scenario', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
      { id: '2', type: 'pause_started', at: t0('2026-02-01T12:00:00') },
      { id: '3', type: 'pause_ended', at: t0('2026-02-01T12:18:00') },
      { id: '4', type: 'pause_started', at: t0('2026-02-01T15:00:00') },
    ];
    const now = t0('2026-02-01T17:00:00');
    const d = getShiftDurations(events, now);
    expect(d.shiftSpanMs).toBe(8 * 60 * 60_000);
    expect(d.totalPausedMs).toBe(18 * 60_000 + 2 * 60 * 60_000);
    expect(d.hasOpenPause).toBe(true);
  });

  it('sums all segments for net work and keeps pause timer on current segment only', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
      { id: '2', type: 'clock_out', at: t0('2026-02-01T12:00:00') },
      { id: '3', type: 'clock_in', at: t0('2026-02-01T13:00:00') },
      { id: '4', type: 'pause_started', at: t0('2026-02-01T14:00:00') },
    ];
    const now = t0('2026-02-01T15:00:00');
    const d = getShiftDurations(events, now);
    expect(d.shiftSpanMs).toBe(3 * 60 * 60_000 + 2 * 60 * 60_000);
    expect(d.totalPausedMs).toBe(60 * 60_000);
    expect(d.activeWorkedMs).toBe(3 * 60 * 60_000 + 60 * 60_000);
    expect(getActiveWorkedMs(events, now)).toBe(d.activeWorkedMs);
    expect(getCurrentPauseElapsedMs(events, now)).toBe(60 * 60_000);
  });

  it('sums completed sub-minute pauses plus open pause for totalPausedMs', () => {
    const cin = t0('2026-02-01T09:00:00');
    const p1Start = t0('2026-02-01T10:00:00');
    const p1End = t0('2026-02-01T10:00:45');
    const p2Start = t0('2026-02-01T11:00:00');
    const p2End = t0('2026-02-01T11:00:30');
    const p3Start = t0('2026-02-01T12:00:00');
    const now = t0('2026-02-01T12:08:00');
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: cin },
      { id: '2', type: 'pause_started', at: p1Start },
      { id: '3', type: 'pause_ended', at: p1End },
      { id: '4', type: 'pause_started', at: p2Start },
      { id: '5', type: 'pause_ended', at: p2End },
      { id: '6', type: 'pause_started', at: p3Start },
    ];
    const d = getShiftDurations(events, now);
    expect(d.totalPausedMs).toBe(45_000 + 30_000 + (now.getTime() - p3Start.getTime()));
    expect(d.hasOpenPause).toBe(true);
  });

  it('main timer reflects cumulative day work when idle between segments', () => {
    const events: AttendanceEvent[] = [
      { id: '1', type: 'clock_in', at: t0('2026-02-01T09:00:00') },
      { id: '2', type: 'clock_out', at: t0('2026-02-01T12:00:00') },
    ];
    const now = t0('2026-02-01T14:00:00');
    expect(getActiveWorkedMs(events, now)).toBe(3 * 60 * 60_000);
  });
});

describe('resolveSnapshotForCalendarDay', () => {
  it('clears events when stored business day is not today', () => {
    const snap = {
      events: [
        { id: '1', type: 'clock_in' as const, at: t0('2026-02-01T09:00:00') },
      ],
      updatedAt: t0('2026-02-01T09:00:00'),
      businessDayKey: '2026-02-01',
    };
    const out = resolveSnapshotForCalendarDay(snap, t0('2026-02-02T08:00:00'));
    expect(out.events).toHaveLength(0);
    expect(out.businessDayKey).toBeNull();
  });

  it('keeps session when business day matches today', () => {
    const snap = {
      events: [
        { id: '1', type: 'clock_in' as const, at: t0('2026-02-02T09:00:00') },
      ],
      updatedAt: t0('2026-02-02T09:00:00'),
      businessDayKey: '2026-02-02',
    };
    const out = resolveSnapshotForCalendarDay(snap, t0('2026-02-02T23:00:00'));
    expect(out.events).toHaveLength(1);
    expect(out.businessDayKey).toBe('2026-02-02');
  });
});
