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
import { resolveSnapshotForCalendarDay } from '../session/resolveSnapshotForCalendarDay';
import { deriveSessionPhase } from '../session/deriveSessionPhase';
import { formatElapsedAsHms } from '../session/formatElapsedHms';
import {
  getActiveWorkedMs,
  getCurrentPauseElapsedMs,
} from '../session/sessionDurations';
import type { AttendanceEvent } from '../types';

const emptySnapshot = (): AttendanceSessionSnapshot => ({
  events: [],
  updatedAt: new Date(0),
  businessDayKey: null,
});

type AttendanceSessionContextValue = Readonly<{
  events: AttendanceEvent[];
  phase: SessionPhase;
  /** Live clock for duration math (updates ~1/s). */
  now: Date;
  mainTimerHms: string;
  breakTimerHms: string | null;
  statusMessage: string;
  /** Clears persisted session when calendar day ≠ stored business day (e.g. Home mount). */
  reconcileCalendarDay: () => void;
  clockIn: () => void;
  startPause: () => void;
  resumeFromPause: () => void;
  clockOut: () => void;
}>;

const AttendanceSessionContext = createContext<AttendanceSessionContextValue | null>(
  null,
);

export function AttendanceSessionProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AttendanceSessionSnapshot>(emptySnapshot);
  const [now, setNow] = useState(() => new Date());
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadAttendanceSession()
      .then(loaded => {
        if (!cancelled) {
          const resolved = resolveSnapshotForCalendarDay(loaded, new Date());
          setSnapshot(resolved);
          hydratedRef.current = true;
          if (!attendanceSnapshotsEqual(loaded, resolved)) {
            Promise.resolve().then(() =>
              saveAttendanceSession(resolved).catch(err => {
                console.error('AttendanceSession: persist after day resolve failed', err);
              }),
            );
          }
        }
      })
      .catch(err => {
        console.error('AttendanceSession: load failed', err);
        hydratedRef.current = true;
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
        setSnapshot(prev => {
          const resolved = resolveSnapshotForCalendarDay(prev, fresh);
          if (!attendanceSnapshotsEqual(prev, resolved)) {
            Promise.resolve().then(() =>
              saveAttendanceSession(resolved).catch(err => {
                console.error('AttendanceSession: save after day rollover failed', err);
              }),
            );
          }
          return resolved;
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
      Promise.resolve().then(() =>
        saveAttendanceSession(result.snapshot).catch(err => {
          console.error('AttendanceSession: save failed', err);
        }),
      );
      return result.snapshot;
    });
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
    setSnapshot(prev => {
      const resolved = resolveSnapshotForCalendarDay(prev, fresh);
      if (!attendanceSnapshotsEqual(prev, resolved)) {
        Promise.resolve().then(() =>
          saveAttendanceSession(resolved).catch(err => {
            console.error('AttendanceSession: save after calendar reconcile failed', err);
          }),
        );
      }
      return resolved;
    });
  }, []);

  const value = useMemo<AttendanceSessionContextValue>(() => {
    const { events } = snapshot;
    const phase = deriveSessionPhase(events);
    const workMs = getActiveWorkedMs(events, now);
    const mainTimerHms = formatElapsedAsHms(workMs);
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
      breakTimerHms,
      statusMessage,
      reconcileCalendarDay,
      clockIn,
      startPause,
      resumeFromPause,
      clockOut,
    };
  }, [
    snapshot,
    now,
    clockIn,
    startPause,
    resumeFromPause,
    clockOut,
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
