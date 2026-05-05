import type { TimelineKind } from '../../components/ui/Timeline';
import type {
  AttendanceEvent,
  AttendanceFooterSummary,
  TimelineListRow,
} from './types';
import {
  formatDateHeading,
  formatDuration,
  formatTimePrecise,
} from './formatAttendance';
import { deriveSessionPhase } from './session/deriveSessionPhase';
import { sortAttendanceEvents } from './session/sortAttendanceEvents';
import {
  getPauseTotalsMs,
  getShiftDurations,
} from './session/sessionDurations';
/**
 * Pauses fully on or before `asOf`. Open pause segment ends at `asOf`.
 * @deprecated Prefer `getPauseTotalsMs` from session; kept for tests and call sites.
 */
export function pauseTotals(
  events: readonly AttendanceEvent[],
  asOf: Date,
): { ms: number; hasOpenPause: boolean } {
  const sorted = sortAttendanceEvents(events);
  const { totalPausedMs, hasOpenPause } = getPauseTotalsMs(sorted, asOf);
  return { ms: totalPausedMs, hasOpenPause };
}

export function computeTotals(
  events: readonly AttendanceEvent[],
  asOf: Date,
): {
  totalPausedMs: number;
  activeWorkedMs: number;
  shiftSpanMs: number;
  hasOpenPause: boolean;
} {
  return getShiftDurations(events, asOf);
}

export function computeFooterSummary(
  events: readonly AttendanceEvent[],
  now: Date,
): AttendanceFooterSummary | null {
  const sorted = sortAttendanceEvents(events);
  const clockIn = sorted.find(e => e.type === 'clock_in');
  if (!clockIn) {
    return null;
  }

  const phase = deriveSessionPhase(events);
  const usesProvisionalEnd = phase === 'working' || phase === 'paused';
  const { totalPausedMs, activeWorkedMs, shiftSpanMs, hasOpenPause } =
    computeTotals(events, now);

  return {
    totalPausedMs,
    activeWorkedMs,
    shiftSpanMs,
    usesProvisionalEnd,
    hasOpenPause,
  };
}

/**
 * Date label for the clock card: first clock-in of the **business day** session.
 */
export function formatShiftSessionDateLabel(
  events: readonly AttendanceEvent[],
): string {
  const sorted = sortAttendanceEvents(events);
  const clockIn = sorted.find(e => e.type === 'clock_in');
  if (clockIn === undefined) {
    return '';
  }
  return formatDateHeading(clockIn.at);
}

function lastOpenSegmentClockInId(sorted: readonly AttendanceEvent[]): string | null {
  let id: string | null = null;
  for (const e of sorted) {
    if (e.type === 'clock_in') {
      id = e.id;
    }
    if (e.type === 'clock_out') {
      id = null;
    }
  }
  return id;
}

function sliceForClosedSegmentEndingWithClockOut(
  sorted: readonly AttendanceEvent[],
  clockOutIndex: number,
): AttendanceEvent[] {
  let start = 0;
  for (let i = clockOutIndex - 1; i >= 0; i -= 1) {
    if (sorted[i].type === 'clock_in') {
      start = i;
      break;
    }
  }
  return sorted.slice(start, clockOutIndex + 1);
}

function mapTypeToKind(type: AttendanceEvent['type']): TimelineKind {
  switch (type) {
    case 'clock_in':
      return 'clock_in';
    case 'pause_started':
      return 'pause';
    case 'pause_ended':
      return 'resume';
    case 'clock_out':
      return 'clock_out';
  }
}

function isPauseClosedAfter(
  sorted: readonly AttendanceEvent[],
  pauseStartedIndex: number,
): boolean {
  for (let j = pauseStartedIndex + 1; j < sorted.length; j += 1) {
    const e = sorted[j];
    if (e.type === 'pause_ended') {
      return true;
    }
    if (e.type === 'pause_started') {
      return false;
    }
  }
  return false;
}

function matchingPauseStartMs(
  sorted: readonly AttendanceEvent[],
  pauseEndedIndex: number,
): number | null {
  const stack: number[] = [];
  for (let i = 0; i < pauseEndedIndex; i += 1) {
    const e = sorted[i];
    if (e.type === 'pause_started') {
      stack.push(e.at.getTime());
    } else if (e.type === 'pause_ended') {
      stack.pop();
    }
  }
  return stack.at(-1) ?? null;
}

export function buildTimelineRows(
  events: readonly AttendanceEvent[],
  now: Date,
): TimelineListRow[] {
  const sorted = sortAttendanceEvents(events);
  const n = sorted.length;
  if (n === 0) {
    return [];
  }

  const openSegmentClockInId = lastOpenSegmentClockInId(sorted);

  return sorted.map((e, i) => {
    const dateHeading = '';
    const timePrecise = formatTimePrecise(e.at);
    const isFirst = i === 0;
    const isLast = i === n - 1;

    let title = '';
    let description: string | undefined;
    let metaLine: string | undefined;

    switch (e.type) {
      case 'clock_in':
        title = 'Clock in';
        description = 'Started your work session.';
        metaLine =
          e.id === openSegmentClockInId ? 'Shift in progress' : undefined;
        break;
      case 'pause_started': {
        title = 'Shift paused';
        description = 'Work timer on hold for a break — you are still clocked in.';
        const closed = isPauseClosedAfter(sorted, i);
        if (closed) {
          metaLine = undefined;
        } else {
          const dur = now.getTime() - e.at.getTime();
          metaLine = `Paused · in progress (${formatDuration(dur)})`;
        }
        break;
      }
      case 'pause_ended': {
        title = 'Shift resumed';
        description = 'Work timer running again after your break.';
        const startMs = matchingPauseStartMs(sorted, i);
        if (startMs != null) {
          const dur = e.at.getTime() - startMs;
          metaLine =
            dur <= 0 ? '0m break' : `Break duration: ${formatDuration(dur)}`;
        }
        break;
      }
      case 'clock_out': {
        title = 'Clock out';
        description = 'Ended your work session.';
        const segmentSlice = sliceForClosedSegmentEndingWithClockOut(sorted, i);
        const t = computeTotals(segmentSlice, e.at);
        metaLine = `Net active time (through clock out): ${formatDuration(t.activeWorkedMs)}`;
        break;
      }
    }

    return {
      id: e.id,
      eventType: e.type,
      eventAt: e.at,
      kind: mapTypeToKind(e.type),
      dateHeading,
      timePrecise,
      title,
      description,
      metaLine,
      isFirst,
      isLast,
    };
  });
}
