import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  getAttendanceHistoryDay,
  mirrorLiveSessionToHistoryIfToday,
  resolveLiveSnapshotWithArchive,
  upsertAttendanceHistoryDay,
} from '../history';
import type {
  AttendanceAction,
  AttendanceSessionSnapshot,
  SessionPhase,
} from '../session/attendanceSessionTypes';
import { applyAttendanceAction } from '../session/applyAttendanceAction';
import { attendanceSnapshotsEqual } from '../session/attendanceSnapshotEquality';
import {
  loadAttendanceSession,
  saveAttendanceSession,
} from '../session/attendanceSessionStorage';
import { deriveSessionPhase } from '../session/deriveSessionPhase';
import { formatElapsedAsHms } from '../session/formatElapsedHms';
import { getLocalCalendarDayKey } from '../session/localCalendarDayKey';
import {
  deleteAttendanceEvent,
  editAttendanceEventTime,
} from '../session/mutateAttendanceEvents';
import { sortAttendanceEvents } from '../session/sortAttendanceEvents';
import {
  getActiveWorkedMs,
  getCurrentPauseElapsedMs,
  getWorkTargetReachedAt,
} from '../session/sessionDurations';
import type { AttendanceEvent } from '../types';

const emptySnapshot = (): AttendanceSessionSnapshot => ({
  events: [],
  updatedAt: new Date(0),
  businessDayKey: null,
});

function eventsEqualByIdentityAndTime(
  a: readonly AttendanceEvent[],
  b: readonly AttendanceEvent[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].id !== b[i].id || a[i].at.getTime() !== b[i].at.getTime()) {
      return false;
    }
  }
  return true;
}

function deriveBusinessDayKeyFromEvents(
  events: readonly AttendanceEvent[],
): string | null {
  if (events.length === 0) {
    return null;
  }
  const sorted = sortAttendanceEvents(events);
  const firstClockIn = sorted.find(event => event.type === 'clock_in');
  if (firstClockIn != null) {
    return getLocalCalendarDayKey(firstClockIn.at);
  }
  return getLocalCalendarDayKey(sorted[0].at);
}

const REQUIRED_WORK_HOURS = 8;
const REQUIRED_WORK_MS = REQUIRED_WORK_HOURS * 60 * 60 * 1000;

function formatEstimatedClockOutTime(at: Date): string {
  return at.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

type AttendanceSessionContextValue = Readonly<{
  events: AttendanceEvent[];
  phase: SessionPhase;
  /** Live clock for duration math (updates ~1/s). */
  now: Date;
  mainTimerHms: string;
  estimatedClockOutTimeLabel: string | null;
  hasReachedRequiredWorkHours: boolean;
  breakTimerHms: string | null;
  statusMessage: string;
  /** Clears persisted session when calendar day ≠ stored business day (e.g. Home mount). */
  reconcileCalendarDay: () => void;
  clockIn: () => void;
  startPause: () => void;
  resumeFromPause: () => void;
  clockOut: () => void;
  editTimelineEntryTime: (
    dayKey: string,
    eventId: string,
    nextAt: Date,
  ) => Promise<Readonly<{ ok: boolean; message?: string }>>;
  deleteTimelineEntry: (dayKey: string, eventId: string) => Promise<void>;
}>;

const AttendanceSessionContext = createContext<AttendanceSessionContextValue | null>(
  null,
);

export function AttendanceSessionProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [snapshot, setSnapshot] = useState<AttendanceSessionSnapshot>(emptySnapshot);
  const [now, setNow] = useState(() => new Date());
  const hydratedRef = useRef(false);
  const snapshotRef = useRef<AttendanceSessionSnapshot>(emptySnapshot());

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadAttendanceSession();
        if (cancelled) {
          return;
        }
        const anchor = new Date();
        const resolved = await resolveLiveSnapshotWithArchive(loaded, anchor);
        setSnapshot(resolved);
        hydratedRef.current = true;
        if (!attendanceSnapshotsEqual(loaded, resolved)) {
          await saveAttendanceSession(resolved).catch(err => {
            console.error('AttendanceSession: persist after day resolve failed', err);
          });
        }
        await mirrorLiveSessionToHistoryIfToday(resolved, anchor).catch(err => {
          console.error('AttendanceSession: mirror history after load failed', err);
        });
      } catch (err) {
        console.error('AttendanceSession: load failed', err);
        hydratedRef.current = true;
      }
    })().catch(() => {
      /* unhandled rejection guard */
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') {
        const fresh = new Date();
        setNow(fresh);
        if (!hydratedRef.current) {
          return;
        }
        (async () => {
          const prev = snapshotRef.current;
          const resolved = await resolveLiveSnapshotWithArchive(prev, fresh);
          if (!attendanceSnapshotsEqual(prev, resolved)) {
            await saveAttendanceSession(resolved).catch(err => {
              console.error('AttendanceSession: save after day rollover failed', err);
            });
            setSnapshot(resolved);
          }
          await mirrorLiveSessionToHistoryIfToday(resolved, fresh).catch(err => {
            console.error(
              'AttendanceSession: mirror history after rollover failed',
              err,
            );
          });
        })().catch(() => {
          /* unhandled rejection guard */
        });
      }
    });
    return () => sub.remove();
  }, []);

  const apply = useCallback((action: AttendanceAction) => {
    if (!hydratedRef.current) {
      return;
    }
    const at = new Date();
    setSnapshot(prev => {
      const result = applyAttendanceAction(prev, action, at);
      if (!result.ok) {
        return prev;
      }
      (async () => {
        await saveAttendanceSession(result.snapshot).catch(err => {
          console.error('AttendanceSession: save failed', err);
        });
        await mirrorLiveSessionToHistoryIfToday(result.snapshot, at).catch(err => {
          console.error('AttendanceSession: mirror history after save failed', err);
        });
      })().catch(() => {
        /* unhandled rejection guard */
      });
      return result.snapshot;
    });
  }, []);

  const editTimelineEntryTime = useCallback(
    async (dayKey: string, eventId: string, nextAt: Date) => {
      const mutationAt = new Date();
      const todayKey = getLocalCalendarDayKey(mutationAt);
      if (dayKey === todayKey) {
        const prev = snapshotRef.current;
        const result = editAttendanceEventTime(prev.events, eventId, nextAt);
        if (!result.ok) {
          return { ok: false, message: result.message };
        }
        const nextEvents = result.events;
        if (eventsEqualByIdentityAndTime(nextEvents, prev.events)) {
          return { ok: true };
        }
        const nextSnapshot: AttendanceSessionSnapshot = {
          ...prev,
          events: nextEvents,
          updatedAt: mutationAt,
          businessDayKey: deriveBusinessDayKeyFromEvents(nextEvents),
        };
        setSnapshot(nextSnapshot);
        snapshotRef.current = nextSnapshot;
        await saveAttendanceSession(nextSnapshot).catch(err => {
          console.error('AttendanceSession: save after edit failed', err);
        });
        await mirrorLiveSessionToHistoryIfToday(nextSnapshot, mutationAt).catch(err => {
          console.error('AttendanceSession: mirror history after edit failed', err);
        });
        return { ok: true };
      }

      const existing = await getAttendanceHistoryDay(dayKey, mutationAt);
      if (existing.length === 0) {
        return { ok: false, message: 'No entries found for this day.' };
      }
      const result = editAttendanceEventTime(existing, eventId, nextAt);
      if (!result.ok) {
        return { ok: false, message: result.message };
      }
      const nextEvents = result.events;
      await upsertAttendanceHistoryDay(dayKey, nextEvents, mutationAt, mutationAt).catch(
        err => {
          console.error('AttendanceSession: history upsert after edit failed', err);
        },
      );
      return { ok: true };
    },
    [],
  );

  const deleteTimelineEntry = useCallback(async (dayKey: string, eventId: string) => {
    const mutationAt = new Date();
    const todayKey = getLocalCalendarDayKey(mutationAt);
    if (dayKey === todayKey) {
      const prev = snapshotRef.current;
      const nextEvents = deleteAttendanceEvent(prev.events, eventId);
      if (eventsEqualByIdentityAndTime(nextEvents, prev.events)) {
        return;
      }
      const nextSnapshot: AttendanceSessionSnapshot = {
        ...prev,
        events: nextEvents,
        updatedAt: mutationAt,
        businessDayKey: deriveBusinessDayKeyFromEvents(nextEvents),
      };
      setSnapshot(nextSnapshot);
      snapshotRef.current = nextSnapshot;
      await saveAttendanceSession(nextSnapshot).catch(err => {
        console.error('AttendanceSession: save after delete failed', err);
      });
      await mirrorLiveSessionToHistoryIfToday(nextSnapshot, mutationAt).catch(err => {
        console.error('AttendanceSession: mirror history after delete failed', err);
      });
      return;
    }

    const existing = await getAttendanceHistoryDay(dayKey, mutationAt);
    if (existing.length === 0) {
      return;
    }
    const nextEvents = deleteAttendanceEvent(existing, eventId);
    await upsertAttendanceHistoryDay(dayKey, nextEvents, mutationAt, mutationAt).catch(
      err => {
        console.error('AttendanceSession: history upsert after delete failed', err);
      },
    );
  }, []);

  const clockIn = useCallback(() => apply({ type: 'clock_in' }), [apply]);
  const startPause = useCallback(() => apply({ type: 'start_pause' }), [apply]);
  const resumeFromPause = useCallback(() => apply({ type: 'end_pause' }), [apply]);
  const clockOut = useCallback(() => apply({ type: 'clock_out' }), [apply]);

  const reconcileCalendarDay = useCallback(() => {
    const fresh = new Date();
    setNow(fresh);
    if (!hydratedRef.current) {
      return;
    }
    (async () => {
      const prev = snapshotRef.current;
      const resolved = await resolveLiveSnapshotWithArchive(prev, fresh);
      if (!attendanceSnapshotsEqual(prev, resolved)) {
        await saveAttendanceSession(resolved).catch(err => {
          console.error('AttendanceSession: save after calendar reconcile failed', err);
        });
        setSnapshot(resolved);
      }
      await mirrorLiveSessionToHistoryIfToday(resolved, fresh).catch(err => {
        console.error('AttendanceSession: mirror history after reconcile failed', err);
      });
    })().catch(() => {
      /* unhandled rejection guard */
    });
  }, []);

  const value = useMemo<AttendanceSessionContextValue>(() => {
    const { events } = snapshot;
    const phase = deriveSessionPhase(events);
    const workMs = getActiveWorkedMs(events, now);
    const mainTimerHms = formatElapsedAsHms(workMs);
    const requiredWorkReachedAt = getWorkTargetReachedAt(events, now, REQUIRED_WORK_MS);
    const hasReachedRequiredWorkHours = requiredWorkReachedAt != null;
    const remainingWorkMs = Math.max(0, REQUIRED_WORK_MS - workMs);
    const projectedClockOutAt = new Date(now.getTime() + remainingWorkMs);
    const estimatedClockOutTimeLabel =
      phase === 'idle'
        ? null
        : formatEstimatedClockOutTime(requiredWorkReachedAt ?? projectedClockOutAt);
    const breakMs = getCurrentPauseElapsedMs(events, now);
    const breakTimerHms =
      phase === 'paused' ? formatElapsedAsHms(breakMs) : null;

    let statusMessage = 'Ready to start your day.';
    if (phase === 'working') {
      statusMessage = 'Session in progress.';
    } else if (phase === 'paused') {
      statusMessage = '';
    }

    return {
      events,
      phase,
      now,
      mainTimerHms,
      estimatedClockOutTimeLabel,
      hasReachedRequiredWorkHours,
      breakTimerHms,
      statusMessage,
      reconcileCalendarDay,
      clockIn,
      startPause,
      resumeFromPause,
      clockOut,
      editTimelineEntryTime,
      deleteTimelineEntry,
    };
  }, [
    snapshot,
    now,
    clockIn,
    startPause,
    resumeFromPause,
    clockOut,
    editTimelineEntryTime,
    deleteTimelineEntry,
    reconcileCalendarDay,
  ]);

  return (
    <AttendanceSessionContext.Provider value={value}>
      {children}
    </AttendanceSessionContext.Provider>
  );
}

export function useAttendanceSession(): AttendanceSessionContextValue {
  const ctx = useContext(AttendanceSessionContext);
  if (ctx == null) {
    throw new Error(
      'useAttendanceSession must be used within AttendanceSessionProvider',
    );
  }
  return ctx;
}
