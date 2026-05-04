import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  archiveStaleLiveSnapshotIfNeeded,
  getAttendanceHistoryDay,
  upsertAttendanceHistoryDay,
} from '../src/features/attendance/history';
import type { AttendanceSessionSnapshot } from '../src/features/attendance/session/attendanceSessionTypes';
import { oldestRetainedAttendanceHistoryDayKey } from '../src/features/attendance/session/localCalendarDayKey';

describe('attendanceHistoryStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('oldestRetainedAttendanceHistoryDayKey is local today minus 30 days', () => {
    const now = new Date(2026, 4, 4, 12, 0, 0);
    expect(oldestRetainedAttendanceHistoryDayKey(now)).toBe('2026-04-04');
  });

  test('upsertAttendanceHistoryDay persists and getAttendanceHistoryDay reads back', async () => {
    const now = new Date('2026-05-10T12:00:00');
    const events = [
      {
        id: '1',
        type: 'clock_in' as const,
        at: new Date('2026-05-09T09:00:00'),
      },
      {
        id: '2',
        type: 'clock_out' as const,
        at: new Date('2026-05-09T17:00:00'),
      },
    ];
    await upsertAttendanceHistoryDay('2026-05-09', events, now, now);
    const loaded = await getAttendanceHistoryDay('2026-05-09', now);
    expect(loaded).toHaveLength(2);
    expect(loaded[0]?.type).toBe('clock_in');
    expect(loaded[1]?.type).toBe('clock_out');
  });

  test('archiveStaleLiveSnapshotIfNeeded writes non-today business day to history', async () => {
    const now = new Date('2026-05-10T08:00:00');
    const snap: AttendanceSessionSnapshot = {
      businessDayKey: '2026-05-09',
      events: [
        { id: 'a', type: 'clock_in', at: new Date('2026-05-09T10:00:00') },
        { id: 'b', type: 'clock_out', at: new Date('2026-05-09T11:00:00') },
      ],
      updatedAt: new Date('2026-05-09T11:00:00'),
    };
    await archiveStaleLiveSnapshotIfNeeded(snap, now);
    const loaded = await getAttendanceHistoryDay('2026-05-09', now);
    expect(loaded).toHaveLength(2);
  });

  test('archiveStale auto-clocks out an open working shift before archiving', async () => {
    const now = new Date('2026-05-10T08:00:00');
    const snap: AttendanceSessionSnapshot = {
      businessDayKey: '2026-05-09',
      events: [
        { id: 'a', type: 'clock_in', at: new Date('2026-05-09T22:00:00') },
      ],
      updatedAt: new Date('2026-05-09T22:00:00'),
    };
    await archiveStaleLiveSnapshotIfNeeded(snap, now);
    const loaded = await getAttendanceHistoryDay('2026-05-09', now);
    expect(loaded).toHaveLength(2);
    expect(loaded[1]?.type).toBe('clock_out');
    expect(loaded[1]?.at.getTime()).toBe(now.getTime());
  });

  test('archiveStale ends pause then clocks out when shift was on break', async () => {
    const now = new Date('2026-05-10T08:00:00');
    const snap: AttendanceSessionSnapshot = {
      businessDayKey: '2026-05-09',
      events: [
        { id: 'a', type: 'clock_in', at: new Date('2026-05-09T09:00:00') },
        { id: 'b', type: 'pause_started', at: new Date('2026-05-09T12:00:00') },
      ],
      updatedAt: new Date('2026-05-09T12:00:00'),
    };
    await archiveStaleLiveSnapshotIfNeeded(snap, now);
    const loaded = await getAttendanceHistoryDay('2026-05-09', now);
    expect(loaded.map(e => e.type)).toEqual([
      'clock_in',
      'pause_started',
      'pause_ended',
      'clock_out',
    ]);
    expect(loaded[2]?.at.getTime()).toBe(now.getTime());
    expect(loaded[3]?.at.getTime()).toBe(now.getTime());
  });

  test('prune drops keys older than 31-day window on next write', async () => {
    const now = new Date('2026-06-15T12:00:00');
    const oldKey = '2026-04-01';
    const minKey = oldestRetainedAttendanceHistoryDayKey(now);
    expect(oldKey < minKey).toBe(true);
    await upsertAttendanceHistoryDay(
      oldKey,
      [{ id: 'x', type: 'clock_in', at: new Date('2026-04-01T09:00:00') }],
      now,
      now,
    );
    await upsertAttendanceHistoryDay(
      '2026-06-15',
      [{ id: 'y', type: 'clock_in', at: new Date('2026-06-15T09:00:00') }],
      now,
      now,
    );
    const prunedOld = await getAttendanceHistoryDay(oldKey, now);
    expect(prunedOld).toHaveLength(0);
    const kept = await getAttendanceHistoryDay('2026-06-15', now);
    expect(kept).toHaveLength(1);
  });
});
