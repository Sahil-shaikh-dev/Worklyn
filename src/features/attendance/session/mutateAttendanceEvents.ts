import type { AttendanceEvent } from '../types';
import { sortAttendanceEvents } from './sortAttendanceEvents';

type PausePair = Readonly<{
  startId: string;
  endId: string;
}>;

export type EditAttendanceEventTimeResult =
  | Readonly<{
      ok: true;
      events: AttendanceEvent[];
    }>
  | Readonly<{
      ok: false;
      message: string;
    }>;

function buildPausePairs(sorted: readonly AttendanceEvent[]): PausePair[] {
  const stack: string[] = [];
  const pairs: PausePair[] = [];
  for (const event of sorted) {
    if (event.type === 'pause_started') {
      stack.push(event.id);
      continue;
    }
    if (event.type === 'pause_ended') {
      const startId = stack.pop();
      if (startId != null) {
        pairs.push({ startId, endId: event.id });
      }
    }
  }
  return pairs;
}

function pairedPauseEventId(
  sorted: readonly AttendanceEvent[],
  event: AttendanceEvent,
): string | null {
  if (event.type !== 'pause_started' && event.type !== 'pause_ended') {
    return null;
  }
  const pairs = buildPausePairs(sorted);
  const pair = pairs.find(p =>
    event.type === 'pause_started' ? p.startId === event.id : p.endId === event.id,
  );
  if (pair == null) {
    return null;
  }
  return event.type === 'pause_started' ? pair.endId : pair.startId;
}

export function deleteAttendanceEvent(
  events: readonly AttendanceEvent[],
  eventId: string,
): AttendanceEvent[] {
  const sorted = sortAttendanceEvents(events);
  const targetIndex = sorted.findIndex(event => event.id === eventId);
  const target = targetIndex >= 0 ? sorted[targetIndex] : null;
  if (target == null) {
    return sorted;
  }

  if (target.type === 'clock_in') {
    const idsToRemove = new Set<string>([target.id]);
    for (let i = targetIndex + 1; i < sorted.length; i += 1) {
      const event = sorted[i];
      if (event.type === 'clock_in') {
        break;
      }
      idsToRemove.add(event.id);
      if (event.type === 'clock_out') {
        break;
      }
    }
    return sorted.filter(event => !idsToRemove.has(event.id));
  }

  const pairedId = pairedPauseEventId(sorted, target);
  return sorted.filter(event => event.id !== eventId && event.id !== pairedId);
}

export function editAttendanceEventTime(
  events: readonly AttendanceEvent[],
  eventId: string,
  nextAt: Date,
): EditAttendanceEventTimeResult {
  const sortedCurrent = sortAttendanceEvents(events);
  const targetIndex = sortedCurrent.findIndex(event => event.id === eventId);
  const target = targetIndex >= 0 ? sortedCurrent[targetIndex] : null;
  if (target == null) {
    return { ok: false, message: 'Entry not found.' };
  }
  if (target.at.getTime() === nextAt.getTime()) {
    return { ok: true, events: sortedCurrent };
  }

  const previous = targetIndex > 0 ? sortedCurrent[targetIndex - 1] : null;
  const nextNeighbor =
    targetIndex < sortedCurrent.length - 1 ? sortedCurrent[targetIndex + 1] : null;

  if (previous != null && nextAt.getTime() <= previous.at.getTime()) {
    return {
      ok: false,
      message: `Time must be after ${previous.type.replace('_', ' ')}.`,
    };
  }
  if (nextNeighbor != null && nextAt.getTime() >= nextNeighbor.at.getTime()) {
    return {
      ok: false,
      message: `Time must be before ${nextNeighbor.type.replace('_', ' ')}.`,
    };
  }

  const nextEvents = events.map(event =>
    event.id === eventId ? { ...event, at: new Date(nextAt) } : event,
  );
  const sortedNext = sortAttendanceEvents(nextEvents);

  let phase: 'idle' | 'working' | 'paused' = 'idle';
  for (const event of sortedNext) {
    if (event.type === 'clock_in') {
      if (phase !== 'idle') {
        return {
          ok: false,
          message: 'Clock in must come before pauses and clock out.',
        };
      }
      phase = 'working';
      continue;
    }
    if (event.type === 'pause_started') {
      if (phase !== 'working') {
        return {
          ok: false,
          message: 'Pause can only start during an active shift.',
        };
      }
      phase = 'paused';
      continue;
    }
    if (event.type === 'pause_ended') {
      if (phase !== 'paused') {
        return {
          ok: false,
          message: 'Resume must come after a pause start.',
        };
      }
      phase = 'working';
      continue;
    }
    if (event.type === 'clock_out') {
      if (phase !== 'working') {
        return {
          ok: false,
          message: 'Clock out must come after clock in or resume.',
        };
      }
      phase = 'idle';
    }
  }

  return { ok: true, events: sortedNext };
}
