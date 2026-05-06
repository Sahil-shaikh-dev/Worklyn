import { CalendarX, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';
import { getLocalCalendarDayKey } from '../../features/attendance/session/localCalendarDayKey';
import { AddLeaveEntryModal } from './components/AddLeaveEntryModal';
import { LeaveBalancesModal } from './components/LeaveBalancesModal';
import { LeaveEntryActionsModal } from './components/LeaveEntryActionsModal';
import { LeaveTimelineEntry } from './components/LeaveTimelineEntry';
import {
  buildNextBaseline,
  deriveLeaveBalances,
  getMonthlyAccrualTotalFromMonth,
  sumUsedFromEntries,
  type LeaveBalanceBaseline,
} from './leaveBalanceMath';
import { loadLeavesSnapshot, saveLeavesSnapshot } from './leaveStorage';
import {
  formatLeaveDateChip,
  formatLeaveDateHeading,
  leaveDurationCopy,
  type LeaveEntry,
} from './leaveTimelineFormat';
import { styles } from './styles';

function normalizeDayEntries(
  dayEntries: readonly LeaveEntry[],
  preferred: LeaveEntry,
): LeaveEntry[] {
  const hasFull = dayEntries.some(entry => entry.duration === 'full_day');
  const hasFirstHalf = dayEntries.some(entry => entry.duration === 'half_first');
  const hasSecondHalf = dayEntries.some(entry => entry.duration === 'half_second');

  if (hasFull || (hasFirstHalf && hasSecondHalf)) {
    return [{ ...preferred, duration: 'full_day' }];
  }

  return [preferred];
}

function LeavesScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const [accrualStartMonth] = useState(() => new Date());
  const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([]);
  const [loadedAccrualStartMonth, setLoadedAccrualStartMonth] = useState<Date>(
    () => new Date(),
  );
  const [manualBaseline, setManualBaseline] = useState<LeaveBalanceBaseline>({
    remaining: 0,
    used: 0,
    entryUsedAtSet: 0,
    accrualAtSet: 0,
  });
  const hydratedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const rows = useMemo(
    () =>
      [...leaveEntries].sort((a, b) => b.at.getTime() - a.at.getTime()),
    [leaveEntries],
  );
  const n = rows.length;

  const entryUsedTotal = useMemo(() => sumUsedFromEntries(leaveEntries), [leaveEntries]);
  const accrualTotal = getMonthlyAccrualTotalFromMonth(loadedAccrualStartMonth, new Date());
  const { remaining: remainingLeaves, used: usedLeaves } = useMemo(
    () => deriveLeaveBalances(manualBaseline, entryUsedTotal, accrualTotal),
    [manualBaseline, entryUsedTotal, accrualTotal],
  );
  const [balancesModalVisible, setBalancesModalVisible] = useState(false);
  const [addLeaveModalVisible, setAddLeaveModalVisible] = useState(false);
  const [editingLeaveEntry, setEditingLeaveEntry] = useState<LeaveEntry | null>(
    null,
  );
  const [leaveEntryForActions, setLeaveEntryForActions] =
    useState<LeaveEntry | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let alive = true;

    const hydrate = async () => {
      const snapshot = await loadLeavesSnapshot(accrualStartMonth);
      if (!alive) {
        return;
      }

      setLoadedAccrualStartMonth(snapshot.accrualStartMonth);
      setLeaveEntries(snapshot.leaveEntries);
      setManualBaseline(snapshot.manualBaseline);
      hydratedRef.current = true;
      setIsHydrated(true);
    };

    hydrate();

    return () => {
      alive = false;
    };
  }, [accrualStartMonth]);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    void saveLeavesSnapshot({
      accrualStartMonth: loadedAccrualStartMonth,
      manualBaseline,
      leaveEntries,
    });
  }, [leaveEntries, loadedAccrualStartMonth, manualBaseline]);

  /**
   * Tab screens are already laid out above the tab bar; do not add tab bar
   * height here or the FAB and scroll padding sit too high.
   */
  const fabBottom = theme.spacing[4];
  const fabRight = theme.spacing[4] + insets.right;

  const openBalancesModal = useCallback(() => {
    if (!isHydrated) {
      return;
    }
    setBalancesModalVisible(true);
  }, [isHydrated]);

  const handleBalancesSave = useCallback(
    async (values: { remaining: number; used: number }) => {
      setManualBaseline(buildNextBaseline(values, entryUsedTotal, accrualTotal));
      setBalancesModalVisible(false);
    },
    [entryUsedTotal, accrualTotal],
  );

  const dismissBalancesModal = useCallback(() => {
    setBalancesModalVisible(false);
  }, []);

  const openAddLeaveModal = useCallback(() => {
    if (!isHydrated) {
      return;
    }
    setEditingLeaveEntry(null);
    setAddLeaveModalVisible(true);
  }, [isHydrated]);

  const dismissAddLeaveModal = useCallback(() => {
    setEditingLeaveEntry(null);
    setAddLeaveModalVisible(false);
  }, []);

  const openEditLeaveModal = useCallback((entry: LeaveEntry) => {
    if (!isHydrated) {
      return;
    }
    setEditingLeaveEntry(entry);
    setAddLeaveModalVisible(true);
  }, [isHydrated]);

  const confirmDeleteLeave = useCallback((entry: LeaveEntry) => {
    setLeaveEntries(prev => prev.filter(e => e.id !== entry.id));
  }, []);

  const dismissLeaveEntryActions = useCallback(() => {
    setLeaveEntryForActions(null);
  }, []);

  const handleLeaveEntryActionEdit = useCallback(
    (entry: LeaveEntry) => {
      setLeaveEntryForActions(null);
      openEditLeaveModal(entry);
    },
    [openEditLeaveModal],
  );

  const handleLeaveEntryActionDelete = useCallback(
    (entry: LeaveEntry) => {
      setLeaveEntryForActions(null);
      confirmDeleteLeave(entry);
    },
    [confirmDeleteLeave],
  );

  const handleAddLeaveSave = useCallback(async (entry: LeaveEntry) => {
    setLeaveEntries(prev => {
      const targetDayKey = getLocalCalendarDayKey(entry.at);
      const withoutEdited = prev.filter(existing => existing.id !== entry.id);
      const sameDayEntries = withoutEdited.filter(
        existing => getLocalCalendarDayKey(existing.at) === targetDayKey,
      );
      const otherDays = withoutEdited.filter(
        existing => getLocalCalendarDayKey(existing.at) !== targetDayKey,
      );
      const normalizedForDay = normalizeDayEntries(
        [...sameDayEntries, entry],
        entry,
      );

      return [...otherDays, ...normalizedForDay];
    });
    setEditingLeaveEntry(null);
    setAddLeaveModalVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(reducedMotion ? 120 : 220)} style={styles.summaryBlock}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <Pressable
                accessibilityHint="Opens a form to edit remaining and used leave counts"
                accessibilityLabel="Remaining leaves"
                accessibilityRole="button"
                delayLongPress={450}
                onLongPress={openBalancesModal}
                style={({ pressed }) => [
                  styles.metricCard,
                  styles.metricCardRemaining,
                  pressed && styles.metricCardPressed,
                ]}>
                <Text style={styles.metricLabel} numberOfLines={2}>
                  Remaining leaves
                </Text>
                <Text
                  style={[styles.metricValue, styles.metricValueRemaining]}
                  numberOfLines={2}>
                  {String(remainingLeaves)}
                </Text>
              </Pressable>
            </View>
            <View style={styles.summaryCell}>
              <Pressable
                accessibilityHint="Opens a form to edit remaining and used leave counts"
                accessibilityLabel="Used leaves"
                accessibilityRole="button"
                delayLongPress={450}
                onLongPress={openBalancesModal}
                style={({ pressed }) => [
                  styles.metricCard,
                  styles.metricCardUsed,
                  pressed && styles.metricCardPressed,
                ]}>
                <Text style={styles.metricLabel} numberOfLines={2}>
                  Used leaves
                </Text>
                <Text style={[styles.metricValue, styles.metricValueUsed]} numberOfLines={2}>
                  {String(usedLeaves)}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.timelineScrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.timelineScroll}>
        <View
          style={[styles.historySection, n === 0 ? styles.historySectionEmpty : null]}>
          <Text style={styles.sectionTitle}>Leave history</Text>
          {n === 0 ? (
            <View style={styles.emptyTimeline}>
              <View style={styles.emptyTimelineIconWrap}>
                <CalendarX
                  color={theme.colors.mutedForeground}
                  size={26}
                  strokeWidth={2}
                />
              </View>
              <Text style={styles.emptyTimelineTitle}>No leave recorded yet</Text>
              <Text style={styles.emptyTimelineSubtitle}>
                When you take time off, entries will show up here from newest to
                oldest. Tap + to add your first leave.
              </Text>
            </View>
          ) : (
            rows.map((row, index) => {
              const copy = leaveDurationCopy(row.duration);
              return (
                <LeaveTimelineEntry
                  key={row.id}
                  dateChip={formatLeaveDateChip(row.at)}
                  dateHeading={formatLeaveDateHeading(row.at)}
                  isFirst={index === 0}
                  isLast={index === n - 1}
                  onLongPressCard={() => {
                    if (!isHydrated) {
                      return;
                    }
                    setLeaveEntryForActions(row);
                  }}
                  reason={row.reason}
                  title={copy.title}
                  titleSuffix={copy.titleSuffix}
                  variant={copy.variant}
                />
              );
            })
          )}
        </View>
      </Animated.ScrollView>

      <Pressable
        accessibilityLabel="Add leave"
        accessibilityRole="button"
        hitSlop={12}
        onPress={openAddLeaveModal}
        style={({ pressed }) => {
          let opacity = 0.6;
          if (isHydrated) {
            opacity = pressed ? 0.92 : 1;
          }
          return [
            styles.fab,
            {
              bottom: fabBottom,
              right: fabRight,
              opacity,
            },
          ];
        }}>
        <Plus color={theme.colors.primaryForeground} size={28} strokeWidth={2.4} />
      </Pressable>

      <LeaveEntryActionsModal
        entry={leaveEntryForActions}
        onDelete={handleLeaveEntryActionDelete}
        onEdit={handleLeaveEntryActionEdit}
        onRequestDismiss={dismissLeaveEntryActions}
      />

      <AddLeaveEntryModal
        editingEntry={editingLeaveEntry}
        onRequestDismiss={dismissAddLeaveModal}
        onSave={handleAddLeaveSave}
        visible={addLeaveModalVisible}
      />

      <LeaveBalancesModal
        onRequestDismiss={dismissBalancesModal}
        onSave={handleBalancesSave}
        remaining={remainingLeaves}
        used={usedLeaves}
        visible={balancesModalVisible}
      />
    </View>
  );
}

export default LeavesScreen;
