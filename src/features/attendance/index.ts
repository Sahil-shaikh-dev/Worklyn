export {
  AttendanceSessionProvider,
  useAttendanceSession,
} from './context/AttendanceSessionContext';
export type { AttendanceEvent, AttendanceFooterSummary, TimelineListRow } from './types';
export { formatDateHeading, formatDuration, formatTimePrecise } from './formatAttendance';
export {
  mockAttendanceDemoNow,
  mockAttendanceEvents,
} from './mockSessionTimeline';
export * from './session';
export {
  buildTimelineRows,
  computeFooterSummary,
  computeTotals,
  formatShiftSessionDateLabel,
  pauseTotals,
} from './timelineViewModel';
