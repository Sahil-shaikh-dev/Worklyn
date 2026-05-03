import type { AttendanceEvent } from '../types';

export function sortAttendanceEvents(
  events: readonly AttendanceEvent[],
): AttendanceEvent[] {
  return [...events].sort((a, b) => a.at.getTime() - b.at.getTime());
}
