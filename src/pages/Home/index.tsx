import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, type ListRenderItemInfo, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeaderBar } from '../../components/layout';
import { DisplayNameModal, TimelineItem } from '../../components/ui';
import {
  buildTimelineRows,
  computeFooterSummary,
  formatShiftSessionDateLabel,
  useAttendanceSession,
  type TimelineListRow,
} from '../../features/attendance';
import {
  formatDisplayNameForHeader,
  isValidDisplayName,
  useUserProfile,
} from '../../features/userProfile';
import { AttendanceSummaryFooter } from './components/AttendanceSummaryFooter';
import { CheckInStatusCard } from './components/CheckInStatusCard';
import { styles } from './styles';

function Home() {
  const insets = useSafeAreaInsets();
  const session = useAttendanceSession();
  const profile = useUserProfile();
  const [editNameOpen, setEditNameOpen] = useState(false);

  const hasSavedName = isValidDisplayName(profile.displayName);
  const showInitialNameModal = profile.hydrated && !hasSavedName;
  const nameModalVisible = showInitialNameModal || editNameOpen;
  const nameModalMode = showInitialNameModal ? 'initial' : 'edit';
  const nameModalSeed = showInitialNameModal ? '' : profile.displayName.trim();

  useEffect(() => {
    session.reconcileCalendarDay();
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

  const localHour = session.now.getHours();
  const displayNameTrimmed = profile.displayName.trim();
  const headerGreeting = useMemo(() => {
    let prefix: string;
    if (localHour >= 5 && localHour < 12) {
      prefix = 'Good morning';
    } else if (localHour >= 12 && localHour < 16) {
      prefix = 'Good afternoon';
    } else {
      prefix = 'Good evening';
    }
    const name = hasSavedName
      ? formatDisplayNameForHeader(displayNameTrimmed)
      : 'there';
    return `${prefix}, ${name}.`;
  }, [localHour, hasSavedName, displayNameTrimmed]);

  const avatarInitial = useMemo(() => {
    if (!hasSavedName || displayNameTrimmed.length === 0) {
      return '?';
    }
    const formatted = formatDisplayNameForHeader(displayNameTrimmed);
    const ch = formatted.charAt(0);
    return ch || '?';
  }, [hasSavedName, displayNameTrimmed]);

  const handleSaveDisplayName = useCallback(
    async (trimmed: string) => {
      await profile.setDisplayName(trimmed);
      setEditNameOpen(false);
    },
    [profile],
  );

  const handleDismissNameModal = useCallback(() => {
    setEditNameOpen(false);
  }, []);

  const renderItem = useCallback((info: ListRenderItemInfo<TimelineListRow>) => {
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
  }, []);

  const keyExtractor = useCallback((item: TimelineListRow) => item.id, []);

  const listFooter = useMemo(
    () =>
      footerSummary ? (
        <AttendanceSummaryFooter summary={footerSummary} />
      ) : null,
    [footerSummary],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DisplayNameModal
        initialName={nameModalSeed}
        mode={nameModalMode}
        onRequestDismiss={handleDismissNameModal}
        onSave={handleSaveDisplayName}
        visible={nameModalVisible}
      />
      <AppHeaderBar
        avatarInitial={avatarInitial}
        greeting={headerGreeting}
        onAvatarLongPress={
          hasSavedName ? () => setEditNameOpen(true) : undefined
        }
      />
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
