import type { TimelineKind } from '../../components/ui';

export type AttendanceEvent =
  | { id: string; type: 'clock_in'; at: Date }
  | { id: string; type: 'pause_started'; at: Date }
  | { id: string; type: 'pause_ended'; at: Date }
  | { id: string; type: 'clock_out'; at: Date };

export type TimelineListRow = Readonly<{
  id: string;
  kind: TimelineKind;
  dateHeading: string;
  timePrecise: string;
  title: string;
  description?: string;
  metaLine?: string;
  isFirst: boolean;
  isLast: boolean;
}>;

export type AttendanceFooterSummary = Readonly<{
  totalPausedMs: number;
  activeWorkedMs: number;
  shiftSpanMs: number;
  /** Shown when shift end is provisional (no clock out). */
  usesProvisionalEnd: boolean;
  /** Shown when an unclosed pause uses `now` in totals. */
  hasOpenPause: boolean;
}>;
