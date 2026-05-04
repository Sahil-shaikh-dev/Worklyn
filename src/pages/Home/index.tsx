import { useCallback, useEffect, useMemo } from 'react';
import { FlatList, type ListRenderItemInfo, View } from 'react-native';
import { TimelineItem } from '../../components/ui';
import {
  buildTimelineRows,
  computeFooterSummary,
  formatShiftSessionDateLabel,
  useAttendanceSession,
  type TimelineListRow,
} from '../../features/attendance';
import { AttendanceSummaryFooter } from './components/AttendanceSummaryFooter';
import { CheckInStatusCard } from './components/CheckInStatusCard';
import { styles } from './styles';

function Home() {
  const session = useAttendanceSession();

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
        <AttendanceSummaryFooter summary={footerSummary} />
      ) : null,
    [footerSummary],
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
        <FlatList
          contentContainerStyle={styles.listContent}
          data={timelineData}
          extraData={session.now.getTime()}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={listFooter}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={styles.timelineList}
        />
      </View>
    </View>
  );
}

export default Home;
