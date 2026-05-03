import type { AttendanceEvent } from '../types';
import type { SessionPhase } from './attendanceSessionTypes';
import { sortAttendanceEvents } from './sortAttendanceEvents';

export function deriveSessionPhase(
  events: readonly AttendanceEvent[],
): SessionPhase {
  if (events.length === 0) {
    return 'idle';
  }
  const sorted = sortAttendanceEvents(events);
  const last = sorted.at(-1);
  if (last == null) {
    return 'idle';
  }
  if (last.type === 'clock_out') {
    return 'idle';
  }
  if (last.type === 'pause_started') {
    return 'paused';
  }
  return 'working';
}
