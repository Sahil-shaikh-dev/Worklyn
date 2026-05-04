import type { AttendanceSessionSnapshot } from './attendanceSessionTypes';
import { applyAttendanceAction } from './applyAttendanceAction';
import { deriveSessionPhase } from './deriveSessionPhase';
import { getLocalCalendarDayKey } from './localCalendarDayKey';
import { inferStoredBusinessDayKey } from './resolveSnapshotForCalendarDay';

/**
 * When the calendar day rolls while a shift is still open, close it for persistence:
 * paused → `end_pause` then `clock_out`; working → `clock_out`. Uses `now` as event time
 * (typically first moment on the new local day).
 */
export function autoCloseOpenShiftForCalendarRollover(
  snapshot: AttendanceSessionSnapshot,
  now: Date,
): AttendanceSessionSnapshot {
  const todayKey = getLocalCalendarDayKey(now);
  const storedKey = inferStoredBusinessDayKey(snapshot);
  if (
    snapshot.events.length === 0 ||
    storedKey == null ||
    storedKey === todayKey
  ) {
    return snapshot;
  }

  let s = snapshot;
  let phase = deriveSessionPhase(s.events);
  if (phase === 'idle') {
    return s;
  }

  if (phase === 'paused') {
    const endPause = applyAttendanceAction(s, { type: 'end_pause' }, now);
    if (endPause.ok) {
      s = endPause.snapshot;
    }
    phase = deriveSessionPhase(s.events);
  }

  if (phase === 'working') {
    const out = applyAttendanceAction(s, { type: 'clock_out' }, now);
    if (out.ok) {
      s = out.snapshot;
    }
  }

  return s;
}
