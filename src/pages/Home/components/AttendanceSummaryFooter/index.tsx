import { Text, View } from 'react-native';
import type { AttendanceFooterSummary } from '../../../../features/attendance';
import { formatDuration } from '../../../../features/attendance';
import { styles } from './styles';

export type AttendanceSummaryFooterProps = Readonly<{
  summary: AttendanceFooterSummary;
}>;

export function AttendanceSummaryFooter({ summary }: AttendanceSummaryFooterProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>Total paused</Text>
      <Text style={styles.value}>
        {formatDuration(summary.totalPausedMs)}
      </Text>
      <Text style={styles.label}>Active work (net)</Text>
      <Text style={styles.value}>
        {formatDuration(summary.activeWorkedMs)}
      </Text>
      <Text style={styles.label}>Shift span (wall clock)</Text>
      <Text style={styles.value}>
        {formatDuration(summary.shiftSpanMs)}
      </Text>
      {summary.usesProvisionalEnd || summary.hasOpenPause ? (
        <Text style={styles.footnote}>
          {summary.usesProvisionalEnd
            ? 'Shift end is provisional (no clock out yet). Totals use the demo time as session end. '
            : ''}
          {summary.hasOpenPause
            ? 'Includes any pause still in progress through that time.'
            : ''}
        </Text>
      ) : null}
    </View>
  );
}
