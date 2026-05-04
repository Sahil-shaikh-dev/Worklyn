import { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { AttendanceEvent } from '../../../../features/attendance';
import {
  computeTotals,
  formatDuration,
  formatTimePrecise,
  sortAttendanceEvents,
} from '../../../../features/attendance';
import { styles } from './styles';

const EMPTY = '—';

export type HistoryShiftSummaryCardsProps = Readonly<{
  events: readonly AttendanceEvent[];
  asOf: Date;
}>;

type MetricCardProps = Readonly<{
  label: string;
  value: string;
  empty: boolean;
}>;

function MetricCard({ label, value, empty }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text
        style={[styles.value, empty && styles.valueEmpty]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export function HistoryShiftSummaryCards({
  events,
  asOf,
}: HistoryShiftSummaryCardsProps) {
  const payload = useMemo(() => {
    if (events.length === 0) {
      return {
        clockIn: EMPTY,
        clockOut: EMPTY,
        net: EMPTY,
        brk: EMPTY,
        total: EMPTY,
        breakLabel: 'Break',
        empty: true,
      };
    }
    const sorted = sortAttendanceEvents(events);
    const firstIn = sorted.find(e => e.type === 'clock_in');
    const lastOut = [...sorted].reverse().find(e => e.type === 'clock_out');
    if (firstIn == null) {
      return {
        clockIn: EMPTY,
        clockOut: EMPTY,
        net: EMPTY,
        brk: EMPTY,
        total: EMPTY,
        breakLabel: 'Break',
        empty: true,
      };
    }
    const pauseStarts = sorted.filter(e => e.type === 'pause_started').length;
    const { activeWorkedMs, totalPausedMs } = computeTotals(events, asOf);
    const totalNetPlusBreak = activeWorkedMs + totalPausedMs;
    return {
      clockIn: formatTimePrecise(firstIn.at),
      clockOut:
        lastOut != null ? formatTimePrecise(lastOut.at) : EMPTY,
      net: formatDuration(activeWorkedMs),
      brk: formatDuration(totalPausedMs),
      total: formatDuration(totalNetPlusBreak),
      breakLabel: `Break (${pauseStarts})`,
      empty: false,
    };
  }, [events, asOf]);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <View style={styles.cellHalf}>
          <MetricCard
            empty={payload.empty}
            label="Clock in"
            value={payload.clockIn}
          />
        </View>
        <View style={styles.cellHalf}>
          <MetricCard
            empty={payload.empty}
            label="Clock out"
            value={payload.clockOut}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.cellHalf}>
          <MetricCard
            empty={payload.empty}
            label="Net shift"
            value={payload.net}
          />
        </View>
        <View style={styles.cellHalf}>
          <MetricCard
            empty={payload.empty}
            label={payload.breakLabel}
            value={payload.brk}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.cellFull}>
          <MetricCard
            empty={payload.empty}
            label="Total shift time"
            value={payload.total}
          />
        </View>
      </View>
    </View>
  );
}
