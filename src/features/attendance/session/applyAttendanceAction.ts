import type { AttendanceEvent } from '../types';
import type {
  AttendanceAction,
  AttendanceSessionSnapshot,
  AttendanceTransitionResult,
} from './attendanceSessionTypes';
import { createAttendanceEventId } from './createAttendanceEventId';
import { getSortedEventsForCurrentShift } from './currentShiftSlice';
import { deriveSessionPhase } from './deriveSessionPhase';
import { getLocalCalendarDayKey } from './localCalendarDayKey';

function mergeBusinessDayKey(
  prev: AttendanceSessionSnapshot,
  nextEvents: AttendanceEvent[],
  action: AttendanceAction,
  now: Date,
): string | null {
  if (nextEvents.length === 0) {
    return null;
  }
  if (action.type === 'clock_in') {
    return getLocalCalendarDayKey(now);
  }
  if (prev.businessDayKey != null) {
    return prev.businessDayKey;
  }
  const slice = getSortedEventsForCurrentShift(nextEvents);
  const cin = slice.find(e => e.type === 'clock_in');
  return cin != null ? getLocalCalendarDayKey(cin.at) : null;
}

function append(
  snapshot: AttendanceSessionSnapshot,
  event: AttendanceEvent,
  now: Date,
  action: AttendanceAction,
): AttendanceSessionSnapshot {
  const nextEvents = [...snapshot.events, event];
  return {
    events: nextEvents,
    updatedAt: now,
    businessDayKey: mergeBusinessDayKey(snapshot, nextEvents, action, now),
  };
}

export function applyAttendanceAction(
  snapshot: AttendanceSessionSnapshot,
  action: AttendanceAction,
  now: Date,
): AttendanceTransitionResult {
  const phase = deriveSessionPhase(snapshot.events);

  switch (action.type) {
    case 'clock_in': {
      if (phase !== 'idle') {
        return {
          ok: false,
          code: 'ALREADY_CLOCKED_IN',
          message: 'You are already in a shift. Clock out before starting a new one.',
        };
      }
      const appended: AttendanceEvent = {
        id: createAttendanceEventId(),
        type: 'clock_in',
        at: now,
      };
      return {
        ok: true,
        snapshot: append(snapshot, appended, now, action),
        appendedEvent: appended,
      };
    }
    case 'start_pause': {
      if (phase !== 'working') {
        return {
          ok: false,
          code: 'INVALID_PHASE',
          message: 'You can only pause while the work timer is running.',
        };
      }
      const appended: AttendanceEvent = {
        id: createAttendanceEventId(),
        type: 'pause_started',
        at: now,
      };
      return {
        ok: true,
        snapshot: append(snapshot, appended, now, action),
        appendedEvent: appended,
      };
    }
    case 'end_pause': {
      if (phase !== 'paused') {
        return {
          ok: false,
          code: 'NOT_PAUSED',
          message: 'You are not on a break.',
        };
      }
      const appended: AttendanceEvent = {
        id: createAttendanceEventId(),
        type: 'pause_ended',
        at: now,
      };
      return {
        ok: true,
        snapshot: append(snapshot, appended, now, action),
        appendedEvent: appended,
      };
    }
    case 'clock_out': {
      if (phase === 'paused') {
        return {
          ok: false,
          code: 'CLOCK_OUT_WHILE_PAUSED',
          message: 'End your break before clocking out.',
        };
      }
      if (phase !== 'working') {
        return {
          ok: false,
          code: 'INVALID_PHASE',
          message: 'Clock in before you can clock out.',
        };
      }
      const appended: AttendanceEvent = {
        id: createAttendanceEventId(),
        type: 'clock_out',
        at: now,
      };
      return {
        ok: true,
        snapshot: append(snapshot, appended, now, action),
        appendedEvent: appended,
      };
    }
  }
}
