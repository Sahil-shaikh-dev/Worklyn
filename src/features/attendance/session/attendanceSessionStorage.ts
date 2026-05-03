import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AttendanceEvent } from '../types';
import type { AttendanceSessionSnapshot } from './attendanceSessionTypes';

const STORAGE_KEY_V1 = 'worklyn:attendanceSession:v1';
const STORAGE_KEY_V2 = 'worklyn:attendanceSession:v2';

type SerializedV1 = {
  v: 1;
  events: Array<{ id: string; type: AttendanceEvent['type']; at: string }>;
  updatedAt?: string;
};

type SerializedV2 = {
  v: 2;
  businessDayKey?: string | null;
  events: Array<{ id: string; type: AttendanceEvent['type']; at: string }>;
  updatedAt?: string;
};

function isEventType(x: string): x is AttendanceEvent['type'] {
  return (
    x === 'clock_in' ||
    x === 'pause_started' ||
    x === 'pause_ended' ||
    x === 'clock_out'
  );
}

function emptySnapshot(): AttendanceSessionSnapshot {
  return {
    events: [],
    updatedAt: new Date(0),
    businessDayKey: null,
  };
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

function parseUpdatedAt(
  iso: string | undefined,
  fallback: Date,
): Date {
  if (typeof iso !== 'string' || iso === '') {
    return fallback;
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function migrateV1Payload(raw: string): AttendanceSessionSnapshot | null {
  try {
    const data = JSON.parse(raw) as SerializedV1;
    if (data.v !== 1 || !Array.isArray(data.events)) {
      return null;
    }
    const empty = emptySnapshot();
    const events = parseEvents(data.events);
    const updatedAt = parseUpdatedAt(data.updatedAt, empty.updatedAt);
    return {
      events,
      updatedAt,
      businessDayKey: null,
    };
  } catch {
    return null;
  }
}

function parseV2Payload(raw: string): AttendanceSessionSnapshot | null {
  try {
    const data = JSON.parse(raw) as SerializedV2;
    if (data.v !== 2 || !Array.isArray(data.events)) {
      return null;
    }
    const empty = emptySnapshot();
    const events = parseEvents(data.events);
    const updatedAt = parseUpdatedAt(data.updatedAt, empty.updatedAt);
    const businessDayKey =
      typeof data.businessDayKey === 'string' ? data.businessDayKey : null;
    return {
      events,
      updatedAt,
      businessDayKey,
    };
  } catch {
    return null;
  }
}

export async function loadAttendanceSession(): Promise<AttendanceSessionSnapshot> {
  const empty = emptySnapshot();
  try {
    const rawV2 = await AsyncStorage.getItem(STORAGE_KEY_V2);
    if (rawV2 != null && rawV2 !== '') {
      const snap = parseV2Payload(rawV2);
      if (snap != null) {
        return snap;
      }
    }

    const rawV1 = await AsyncStorage.getItem(STORAGE_KEY_V1);
    if (rawV1 != null && rawV1 !== '') {
      const migrated = migrateV1Payload(rawV1);
      if (migrated != null) {
        await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(serializeV2(migrated)));
        await AsyncStorage.removeItem(STORAGE_KEY_V1);
        return migrated;
      }
    }

    return empty;
  } catch {
    return empty;
  }
}

function serializeV2(snapshot: AttendanceSessionSnapshot): SerializedV2 {
  return {
    v: 2,
    businessDayKey: snapshot.businessDayKey,
    events: snapshot.events.map(e => ({
      id: e.id,
      type: e.type,
      at: e.at.toISOString(),
    })),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}

export async function saveAttendanceSession(
  snapshot: AttendanceSessionSnapshot,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(serializeV2(snapshot)));
  await AsyncStorage.removeItem(STORAGE_KEY_V1);
}
