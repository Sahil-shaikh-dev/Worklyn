import { Clock } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type ListRenderItemInfo, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';
import { TimelineItem } from '../../components/ui';
import {
  buildTimelineRows,
  computeFooterSummary,
  formatShiftSessionDateLabel,
  useAttendanceSession,
  type TimelineListRow,
} from '../../features/attendance';
import { getLocalCalendarDayKey } from '../../features/attendance/session/localCalendarDayKey';
import { AttendanceTimelineEntryActionsModal } from '../../features/attendance/components/AttendanceTimelineEntryActionsModal';
import { AttendanceTimelineTimeEditModal } from '../../features/attendance/components/AttendanceTimelineTimeEditModal';
import { HistoryShiftSummaryCards } from '../History/components/HistoryShiftSummaryCards';
import { CheckInStatusCard } from './components/CheckInStatusCard';
import { listLayoutTransition } from '../../theme/motion';
import { styles } from './styles';

const AnimatedFlatList = Animated.FlatList<TimelineListRow>;

function Home() {
  const { theme } = useUnistyles();
  const session = useAttendanceSession();
  const [entryForActions, setEntryForActions] = useState<TimelineListRow | null>(null);
  const [entryForTimeEdit, setEntryForTimeEdit] = useState<TimelineListRow | null>(null);

  useEffect(() => {
    session.reconcileCalendarDay();
    // reconcileCalendarDay is stable; session context value changes every tick (now).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + explicit reconcile API only
  }, [session.reconcileCalendarDay]);

  const timelineData = useMemo(
    () => buildTimelineRows(session.events, session.now),
    [session.events, session.now],
  );

  const footerSummary = useMemo(
    () => computeFooterSummary(session.events, session.now),
    [session.events, session.now],
  );

  const sessionDateLabel = useMemo(
    () => formatShiftSessionDateLabel(session.events),
    [session.events],
  );

  const renderItem = useCallback(
    (info: ListRenderItemInfo<TimelineListRow>) => {
      const row = info.item;
      return (
        <TimelineItem
          dateHeading={row.dateHeading}
          description={row.description}
          isFirst={row.isFirst}
          isLast={row.isLast}
          kind={row.kind}
          metaLine={row.metaLine}
          onLongPressCard={() => setEntryForActions(row)}
          timePrecise={row.timePrecise}
          title={row.title}
        />
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: TimelineListRow) => item.id, []);

  const listFooter = useMemo(
    () =>
      footerSummary ? (
        <View style={styles.summaryFooterSection}>
          <HistoryShiftSummaryCards
            asOf={session.now}
            events={session.events}
          />
        </View>
      ) : null,
    [footerSummary, session.events, session.now],
  );

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyTimeline}>
        <View style={styles.emptyTimelineIconWrap}>
          <Clock
            color={theme.colors.mutedForeground}
            size={26}
            strokeWidth={2}
          />
        </View>
        <Text style={styles.emptyTimelineTitle}>No activity on your timeline</Text>
        <Text style={styles.emptyTimelineSubtitle}>
          Clock in above to start your shift. Check-ins, pauses, and clock-out
          will show up here as they happen.
        </Text>
      </View>
    ),
    [theme.colors.mutedForeground],
  );

  const listContentStyle = useMemo(
    () =>
      timelineData.length === 0 ? styles.listContentEmpty : styles.listContent,
    [timelineData.length],
  );

  const todayDayKey = useMemo(
    () => getLocalCalendarDayKey(session.now),
    [session.now],
  );

  const handleDeleteEntry = useCallback(
    async (entry: TimelineListRow) => {
      setEntryForActions(null);
      await session.deleteTimelineEntry(todayDayKey, entry.id);
    },
    [session, todayDayKey],
  );

  const handleEditEntry = useCallback((entry: TimelineListRow) => {
    setEntryForActions(null);
    setEntryForTimeEdit(entry);
  }, []);

  const handleSubmitTimeEdit = useCallback(
    async (entry: TimelineListRow, nextAt: Date) => {
      const result = await session.editTimelineEntryTime(todayDayKey, entry.id, nextAt);
      if (result.ok) {
        setEntryForTimeEdit(null);
      }
      return result;
    },
    [session, todayDayKey],
  );

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.clockSection}>
          <CheckInStatusCard
            breakTimerHms={session.breakTimerHms}
            mainTimerHms={session.mainTimerHms}
            onClockIn={session.clockIn}
            onClockOut={session.clockOut}
            onResumeFromPause={session.resumeFromPause}
            onStartPause={session.startPause}
            sessionDateLabel={sessionDateLabel}
            sessionPhase={session.phase}
            statusMessage={session.statusMessage}
          />
        </View>
        <AnimatedFlatList
          contentContainerStyle={listContentStyle}
          data={timelineData}
          extraData={session.now.getTime()}
          itemLayoutAnimation={listLayoutTransition}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={styles.timelineList}
        />
        <AttendanceTimelineEntryActionsModal
          entry={entryForActions}
          onDelete={handleDeleteEntry}
          onEditTime={handleEditEntry}
          onRequestDismiss={() => setEntryForActions(null)}
        />
        <AttendanceTimelineTimeEditModal
          entry={entryForTimeEdit}
          onRequestDismiss={() => setEntryForTimeEdit(null)}
          onSubmit={handleSubmitTimeEdit}
        />
      </View>
    </View>
  );
}

export default Home;
