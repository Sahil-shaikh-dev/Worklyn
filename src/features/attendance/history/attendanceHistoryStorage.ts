import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AttendanceEvent } from '../types';
import type { AttendanceSessionSnapshot } from '../session/attendanceSessionTypes';
import type { DayKey } from '../session/localCalendarDayKey';
import {
  getLocalCalendarDayKey,
  oldestRetainedAttendanceHistoryDayKey,
} from '../session/localCalendarDayKey';
import { autoCloseOpenShiftForCalendarRollover } from '../session/autoCloseOpenShiftForCalendarRollover';
import { inferStoredBusinessDayKey } from '../session/resolveSnapshotForCalendarDay';

const STORAGE_KEY = 'worklyn:attendanceHistory:v1';

type SerializedEvent = {
  id: string;
  type: AttendanceEvent['type'];
  at: string;
};

type SerializedDay = {
  events: SerializedEvent[];
  updatedAt: string;
};

type SerializedRoot = {
  v: 1;
  days: Record<string, SerializedDay>;
};

function isEventType(x: string): x is AttendanceEvent['type'] {
  return (
    x === 'clock_in' ||
    x === 'pause_started' ||
    x === 'pause_ended' ||
    x === 'clock_out'
  );
}

function parseEvents(rows: unknown): AttendanceEvent[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  const events: AttendanceEvent[] = [];
  for (const row of rows) {
    if (
      row == null ||
      typeof row !== 'object' ||
      typeof (row as { id?: unknown }).id !== 'string' ||
      typeof (row as { type?: unknown }).type !== 'string' ||
      typeof (row as { at?: unknown }).at !== 'string' ||
      !isEventType((row as { type: string }).type)
    ) {
      continue;
    }
    const at = new Date((row as { at: string }).at);
    if (Number.isNaN(at.getTime())) {
      continue;
    }
    events.push({
      id: (row as { id: string }).id,
      type: (row as { type: AttendanceEvent['type'] }).type,
      at,
    });
  }
  return events;
}

function pruneDays(
  days: Record<string, SerializedDay>,
  now: Date,
): Record<string, SerializedDay> {
  const minKey = oldestRetainedAttendanceHistoryDayKey(now);
  const next: Record<string, SerializedDay> = {};
  for (const [k, v] of Object.entries(days)) {
    if (k >= minKey) {
      next[k] = v;
    }
  }
  return next;
}

function serializeEvents(events: readonly AttendanceEvent[]): SerializedEvent[] {
  return events.map(e => ({
    id: e.id,
    type: e.type,
    at: e.at.toISOString(),
  }));
}

function emptyRoot(): SerializedRoot {
  return { v: 1, days: {} };
}

function parseRoot(raw: string | null): SerializedRoot {
  if (raw == null || raw === '') {
    return emptyRoot();
  }
  try {
    const data = JSON.parse(raw) as SerializedRoot;
    if (data.v !== 1 || data.days == null || typeof data.days !== 'object') {
      return emptyRoot();
    }
    return data;
  } catch {
    return emptyRoot();
  }
}

export async function loadAttendanceHistoryRoot(
  now: Date = new Date(),
): Promise<SerializedRoot> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const root = parseRoot(raw);
    const pruned = pruneDays(root.days, now);
    if (Object.keys(pruned).length !== Object.keys(root.days).length) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, days: pruned }));
      return { v: 1, days: pruned };
    }
    return { v: 1, days: root.days };
  } catch {
    return emptyRoot();
  }
}

export async function getAttendanceHistoryDay(
  dayKey: DayKey,
  now: Date = new Date(),
): Promise<readonly AttendanceEvent[]> {
  const root = await loadAttendanceHistoryRoot(now);
  const row = root.days[dayKey];
  if (row == null) {
    return [];
  }
  return parseEvents(row.events);
}

export async function upsertAttendanceHistoryDay(
  dayKey: DayKey,
  events: readonly AttendanceEvent[],
  updatedAt: Date = new Date(),
  now: Date = new Date(),
): Promise<void> {
  const root = await loadAttendanceHistoryRoot(now);
  const days = pruneDays({ ...root.days }, now);
  days[dayKey] = {
    events: serializeEvents(events),
    updatedAt: updatedAt.toISOString(),
  };
  const finalDays = pruneDays(days, now);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, days: finalDays }));
}

/** If live snapshot belongs to a prior calendar day, persist it to history before clearing. */
export async function archiveStaleLiveSnapshotIfNeeded(
  snapshot: AttendanceSessionSnapshot,
  now: Date,
): Promise<void> {
  if (snapshot.events.length === 0) {
    return;
  }
  const todayKey = getLocalCalendarDayKey(now);
  const storedKey = inferStoredBusinessDayKey(snapshot);
  if (storedKey == null || storedKey === todayKey) {
    return;
  }
  const finalized = autoCloseOpenShiftForCalendarRollover(snapshot, now);
  await upsertAttendanceHistoryDay(
    storedKey,
    finalized.events,
    finalized.updatedAt,
    now,
  );
}

/** Mirror today's in-progress session into history so History tab stays in sync. */
export async function mirrorLiveSessionToHistoryIfToday(
  snapshot: AttendanceSessionSnapshot,
  now: Date,
): Promise<void> {
  if (snapshot.events.length === 0) {
    return;
  }
  const todayKey = getLocalCalendarDayKey(now);
  const key = inferStoredBusinessDayKey(snapshot);
  if (key !== todayKey) {
    return;
  }
  await upsertAttendanceHistoryDay(todayKey, snapshot.events, snapshot.updatedAt, now);
}
