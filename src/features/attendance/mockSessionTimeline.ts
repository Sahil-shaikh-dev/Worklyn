import type { AttendanceEvent } from './types';

/**
 * UI-only fixture: completed lunch pause, second pause still open, no clock out.
 * Pair with a fixed "current" time (e.g. `2026-02-01T17:00:00`) for stable copy in demos/tests.
 */
export const mockAttendanceEvents: AttendanceEvent[] = [
  { id: 'ev-1', type: 'clock_in', at: new Date('2026-02-01T09:00:00') },
  { id: 'ev-2', type: 'pause_started', at: new Date('2026-02-01T12:00:00') },
  { id: 'ev-3', type: 'pause_ended', at: new Date('2026-02-01T12:18:00') },
  { id: 'ev-4', type: 'pause_started', at: new Date('2026-02-01T15:00:00') },
];

/** Demo "now" so open-pause and open-shift copy stay deterministic in the UI. */
export const mockAttendanceDemoNow = new Date('2026-02-01T17:00:00');
