import type { AttendanceEvent } from '../types';
import { getSortedEventsForCurrentShift } from './currentShiftSlice';
import { sortAttendanceEvents } from './sortAttendanceEvents';

function sliceByAsOf(
  sorted: readonly AttendanceEvent[],
  asOf: Date,
): AttendanceEvent[] {
  const t = asOf.getTime();
  return sorted.filter(e => e.at.getTime() <= t);
}

/**
 * Sum of completed pause segments plus any open pause through `asOf`.
 */
export function getPauseTotalsMs(
  sorted: readonly AttendanceEvent[],
  asOf: Date,
): { totalPausedMs: number; hasOpenPause: boolean } {
  const tAsOf = asOf.getTime();
  const stack: number[] = [];
  let ms = 0;

  for (const e of sorted) {
    if (e.at.getTime() > tAsOf) {
      break;
    }
    if (e.type === 'pause_started') {
      stack.push(e.at.getTime());
    } else if (e.type === 'pause_ended') {
      const start = stack.pop();
      if (start !== undefined) {
        ms += Math.max(0, e.at.getTime() - start);
      } else if (__DEV__) {
        console.warn('pause_ended without matching pause_started', e.id);
      }
    }
  }

  let hasOpenPause = false;
  if (stack.length > 0) {
    hasOpenPause = true;
    const openStart = stack.at(-1);
    if (openStart !== undefined) {
      ms += Math.max(0, tAsOf - openStart);
    }
  }

  return { totalPausedMs: ms, hasOpenPause };
}

/**
 * Wall shift span, total paused, and net active work through `asOf`.
 * Aggregates **all clock_in → clock_out segments** for the business day (ordered events).
 * Idle gaps between clock out and the next clock in are excluded from span.
 */
export function getShiftDurations(
  events: readonly AttendanceEvent[],
  asOf: Date,
): {
  totalPausedMs: number;
  activeWorkedMs: number;
  shiftSpanMs: number;
  hasOpenPause: boolean;
} {
  const sortedAll = sortAttendanceEvents(events);
  const sorted = sliceByAsOf(sortedAll, asOf);
  const tAsOf = asOf.getTime();

  let totalPausedMs = 0;
  let activeWorkedMs = 0;
  let shiftSpanMs = 0;
  let hasOpenPause = false;

  let idx = 0;
  while (idx < sorted.length) {
    if (sorted[idx].type !== 'clock_in') {
      idx += 1;
      continue;
    }

    const segStart = idx;
    let coutIdx = -1;
    let nextIdx = sorted.length;

    for (let j = segStart + 1; j < sorted.length; j += 1) {
      const t = sorted[j].type;
      if (t === 'clock_in') {
        nextIdx = j;
        break;
      }
      if (t === 'clock_out') {
        coutIdx = j;
        nextIdx = j + 1;
        break;
      }
    }

    const cin = sorted[segStart];
    const segmentSlice = sorted.slice(segStart, nextIdx);

    const effectiveEndMs =
      coutIdx >= 0
        ? Math.min(sorted[coutIdx].at.getTime(), tAsOf)
        : tAsOf;

    const span = Math.max(0, effectiveEndMs - cin.at.getTime());
    shiftSpanMs += span;

    const { totalPausedMs: segPause, hasOpenPause: segOpenPause } =
      getPauseTotalsMs(segmentSlice, asOf);
    totalPausedMs += segPause;
    if (segOpenPause) {
      hasOpenPause = true;
    }
    activeWorkedMs += Math.max(0, span - segPause);

    idx = nextIdx;
  }

  return { totalPausedMs, activeWorkedMs, shiftSpanMs, hasOpenPause };
}

/** Net active work time (main clock); flat during an open pause. */
export function getActiveWorkedMs(
  events: readonly AttendanceEvent[],
  now: Date,
): number {
  return getShiftDurations(events, now).activeWorkedMs;
}

/** Elapsed time for the current open pause segment (0 if not paused). */
export function getCurrentPauseElapsedMs(
  events: readonly AttendanceEvent[],
  now: Date,
): number {
  const sorted = getSortedEventsForCurrentShift(events);
  const last = sorted.at(-1);
  if (last?.type !== 'pause_started') {
    return 0;
  }
  return Math.max(0, now.getTime() - last.at.getTime());
}

/** Alias for card primary display (same as active worked). */
export function getMainTimerDisplayMs(
  events: readonly AttendanceEvent[],
  now: Date,
): number {
  return getActiveWorkedMs(events, now);
}

/**
 * Returns the timestamp when cumulative active work first reaches `targetWorkMs`.
 * If target is not reached by `asOf`, returns null.
 */
export function getWorkTargetReachedAt(
  events: readonly AttendanceEvent[],
  asOf: Date,
  targetWorkMs: number,
): Date | null {
  if (targetWorkMs <= 0) {
    return new Date(asOf);
  }

  const sorted = sortAttendanceEvents(events).filter(e => e.at.getTime() <= asOf.getTime());
  let totalActiveMs = 0;
  let activeSliceStartMs: number | null = null;

  const pushActiveSliceUntil = (sliceEndMs: number): Date | null => {
    if (activeSliceStartMs == null) {
      return null;
    }
    const sliceMs = Math.max(0, sliceEndMs - activeSliceStartMs);
    if (sliceMs === 0) {
      activeSliceStartMs = sliceEndMs;
      return null;
    }
    if (totalActiveMs + sliceMs >= targetWorkMs) {
      const remainingMs = targetWorkMs - totalActiveMs;
      return new Date(activeSliceStartMs + remainingMs);
    }
    totalActiveMs += sliceMs;
    activeSliceStartMs = sliceEndMs;
    return null;
  };

  const closeActiveSlice = (sliceEndMs: number): Date | null => {
    const reachedAt = pushActiveSliceUntil(sliceEndMs);
    activeSliceStartMs = null;
    return reachedAt;
  };

  for (const event of sorted) {
    const eventMs = event.at.getTime();
    switch (event.type) {
      case 'clock_in':
      case 'pause_ended':
        activeSliceStartMs = eventMs;
        break;
      case 'pause_started':
      case 'clock_out': {
        const reachedAt = closeActiveSlice(eventMs);
        if (reachedAt != null) {
          return reachedAt;
        }
        break;
      }
      default:
        break;
    }
  }

  const reachedAtAsOf = pushActiveSliceUntil(asOf.getTime());
  if (reachedAtAsOf != null) {
    return reachedAtAsOf;
  }
  return null;
}
