import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  Text,
  View,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useUnistyles } from 'react-native-unistyles';
import { TimelineItem } from '../../components/ui';
import {
  buildTimelineRows,
  type TimelineListRow,
  useAttendanceSession,
} from '../../features/attendance';
import { getLocalCalendarDayKey } from '../../features/attendance/session/localCalendarDayKey';
import {
  HistoryDayStrip,
  type HistoryDayStripHandle,
} from './components/HistoryDayStrip';
import { HistoryShiftSummaryCards } from './components/HistoryShiftSummaryCards';
import { styles } from './styles';
import { useAttendanceHistoryForSelection } from './useAttendanceHistoryForSelection';
import { buildDayStripItems } from './utils/calendarRange';
import { formatHistorySelectedDateLabel } from './utils/formatHistorySelectedDateLabel';

function HistoryScreen() {
  const { theme } = useUnistyles();
  const stripRef = useRef<HistoryDayStripHandle>(null);
  const session = useAttendanceSession();
  const stripAnchorY = session.now.getFullYear();
  const stripAnchorM = session.now.getMonth();
  const stripAnchorD = session.now.getDate();

  const stripItems = useMemo(
    () => buildDayStripItems(new Date(stripAnchorY, stripAnchorM, stripAnchorD)),
    [stripAnchorD, stripAnchorM, stripAnchorY],
  );

  const todayKey = useMemo(
    () =>
      getLocalCalendarDayKey(
        new Date(stripAnchorY, stripAnchorM, stripAnchorD),
      ),
    [stripAnchorD, stripAnchorM, stripAnchorY],
  );

  const [selectedDayKey, setSelectedDayKey] = useState(() =>
    getLocalCalendarDayKey(session.now),
  );

  const selectedDateHeading = useMemo(
    () => formatHistorySelectedDateLabel(selectedDayKey),
    [selectedDayKey],
  );

  const showBackToToday = selectedDayKey !== todayKey;

  const historyPayload = useAttendanceHistoryForSelection(
    selectedDayKey,
    session.now,
    session.events,
  );

  const timelineData = useMemo(
    () => buildTimelineRows(historyPayload.events, historyPayload.asOf),
    [historyPayload.asOf, historyPayload.events],
  );

  const handleSelectDayKey = useCallback((dayKey: string) => {
    setSelectedDayKey(dayKey);
    stripRef.current?.scrollToDayKey(dayKey);
  }, []);

  const handleBackToToday = useCallback(() => {
    handleSelectDayKey(todayKey);
  }, [handleSelectDayKey, todayKey]);

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

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.stripHeaderRow}>
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={styles.selectedFullDate}
          >
            {selectedDateHeading}
          </Text>
          {showBackToToday ? (
            <Pressable
              accessibilityHint="Shows today in the calendar and timeline"
              accessibilityLabel="Back to today"
              accessibilityRole="button"
              hitSlop={8}
              onPress={handleBackToToday}
              style={({ pressed }) => [
                styles.backToToday,
                pressed && styles.backToTodayPressed,
              ]}
            >
              <Text style={styles.backToTodayLabel}>Back to today</Text>
              <ChevronRight
                color={theme.colors.primary}
                size={16}
                strokeWidth={2.5}
              />
            </Pressable>
          ) : null}
        </View>
        <HistoryDayStrip
          ref={stripRef}
          items={stripItems}
          onSelectDayKey={handleSelectDayKey}
          selectedDayKey={selectedDayKey}
        />
        <HistoryShiftSummaryCards
          asOf={historyPayload.asOf}
          events={historyPayload.events}
        />
      </View>
    ),
    [
      handleBackToToday,
      historyPayload.asOf,
      historyPayload.events,
      handleSelectDayKey,
      selectedDateHeading,
      selectedDayKey,
      showBackToToday,
      stripItems,
      theme.colors.primary,
    ],
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={timelineData}
        extraData={session.now.getTime()}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={styles.emptyTimeline}>
            No attendance for this day.
          </Text>
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={styles.timelineList}
      />
    </View>
  );
}

export default HistoryScreen;
