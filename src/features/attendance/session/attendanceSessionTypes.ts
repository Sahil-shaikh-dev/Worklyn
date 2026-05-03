import type { AttendanceEvent } from '../types';

export type SessionPhase = 'idle' | 'working' | 'paused';

export type AttendanceSessionSnapshot = Readonly<{
  events: AttendanceEvent[];
  /** Last successful mutation time (informational). */
  updatedAt: Date;
  /**
   * Local calendar day (`YYYY-MM-DD`) this session belongs to. Set on `clock_in`;
   * cleared when storage is empty or the calendar day rolls over.
   */
  businessDayKey: string | null;
}>;

export type AttendanceAction =
  | { type: 'clock_in' }
  | { type: 'start_pause' }
  | { type: 'end_pause' }
  | { type: 'clock_out' };

export type AttendanceErrorCode =
  | 'ALREADY_CLOCKED_IN'
  | 'INVALID_PHASE'
  | 'NOT_PAUSED'
  | 'CLOCK_OUT_WHILE_PAUSED';

export type AttendanceTransitionResult =
  | {
      ok: true;
      snapshot: AttendanceSessionSnapshot;
      appendedEvent: AttendanceEvent;
    }
  | {
      ok: false;
      code: AttendanceErrorCode;
      message: string;
    };
