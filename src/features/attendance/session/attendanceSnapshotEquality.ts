import type { AttendanceSessionSnapshot } from './attendanceSessionTypes';

export function attendanceSnapshotsEqual(
  a: AttendanceSessionSnapshot,
  b: AttendanceSessionSnapshot,
): boolean {
  if (a.businessDayKey !== b.businessDayKey) {
    return false;
  }
  if (a.events.length !== b.events.length) {
    return false;
  }
  for (let i = 0; i < a.events.length; i += 1) {
    const ea = a.events[i];
    const eb = b.events[i];
    if (
      ea.id !== eb.id ||
      ea.type !== eb.type ||
      ea.at.getTime() !== eb.at.getTime()
    ) {
      return false;
    }
  }
  return true;
}
