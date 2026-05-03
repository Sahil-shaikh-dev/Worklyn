import type { AttendanceEvent } from '../types';
import { sortAttendanceEvents } from './sortAttendanceEvents';

/**
 * Events for the **current open segment** (latest `clock_in` through today, until the next `clock_out`).
 * Used for pause timing and phase-adjacent helpers; the full-day event list stays in the snapshot.
 */
export function getSortedEventsForCurrentShift(
  events: readonly AttendanceEvent[],
): AttendanceEvent[] {
  const sorted = sortAttendanceEvents(events);
  let sliceStart = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (sorted[i].type === 'clock_out') {
      sliceStart = i + 1;
      break;
    }
  }
  return sorted.slice(sliceStart);
}
