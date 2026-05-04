import type { AttendanceSessionSnapshot } from '../session/attendanceSessionTypes';
import { resolveSnapshotForCalendarDay } from '../session/resolveSnapshotForCalendarDay';
import { archiveStaleLiveSnapshotIfNeeded } from './attendanceHistoryStorage';

export async function resolveLiveSnapshotWithArchive(
  snapshot: AttendanceSessionSnapshot,
  now: Date,
): Promise<AttendanceSessionSnapshot> {
  await archiveStaleLiveSnapshotIfNeeded(snapshot, now);
  return resolveSnapshotForCalendarDay(snapshot, now);
}
