import type { AttendanceEvent } from '../types';
import type { AttendanceSessionSnapshot } from './attendanceSessionTypes';
import { sortAttendanceEvents } from './sortAttendanceEvents';
import { getLocalCalendarDayKey } from './localCalendarDayKey';

function inferBusinessDayKeyFromLegacyEvents(
  events: readonly AttendanceEvent[],
): string | null {
  if (events.length === 0) {
    return null;
  }
  const sorted = sortAttendanceEvents(events);
  const last = sorted.at(-1);
  if (last === undefined) {
    return null;
  }
  return getLocalCalendarDayKey(last.at);
}

/** `businessDayKey` on snapshot, or inferred from last event (legacy payloads). */
export function inferStoredBusinessDayKey(
  snapshot: AttendanceSessionSnapshot,
): string | null {
  if (snapshot.events.length === 0) {
    return null;
  }
  return (
    snapshot.businessDayKey ??
    inferBusinessDayKeyFromLegacyEvents(snapshot.events)
  );
}

/**
 * Drops persisted session when the stored **`businessDayKey`** is not today's local
 * calendar day. Migrates v1 payloads missing `businessDayKey` using the last event's local date.
 */
export function resolveSnapshotForCalendarDay(
  snapshot: AttendanceSessionSnapshot,
  now: Date,
): AttendanceSessionSnapshot {
  const todayKey = getLocalCalendarDayKey(now);

  if (snapshot.events.length === 0) {
    return {
      events: [],
      updatedAt: snapshot.updatedAt,
      businessDayKey: null,
    };
  }

  const storedKey = inferStoredBusinessDayKey(snapshot);
  if (storedKey == null || storedKey !== todayKey) {
    return {
      events: [],
      updatedAt: now,
      businessDayKey: null,
    };
  }

  return {
    ...snapshot,
    businessDayKey: storedKey,
  };
}
