import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';
import { Button, Card, Input } from '../../../../components/ui';
import {
  createLeaveId,
  type LeaveDurationKind,
  type LeaveEntry,
} from '../../leaveTimelineFormat';
import {
  getLocalCalendarDayKey,
  startOfLocalCalendarDay,
} from '../../../../features/attendance/session/localCalendarDayKey';
import { styles } from './styles';

const CUSTOM_REASON = '__custom__' as const;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PREDEFINED_LEAVE_REASONS = [
  'Vacation',
  'Sick leave',
  'Personal',
  'Family / care',
  'Appointment',
] as const;

type PredefinedReason = (typeof PREDEFINED_LEAVE_REASONS)[number];
type ReasonSlot = PredefinedReason | typeof CUSTOM_REASON;

const LEAVE_TYPE_OPTIONS: readonly {
  value: LeaveDurationKind;
  label: string;
}[] = [
  { value: 'full_day', label: 'Full day' },
  { value: 'half_first', label: 'Half day — first half' },
  { value: 'half_second', label: 'Half day — second half' },
];

const REASON_GRID_ROWS: (readonly ReasonSlot[])[] = (() => {
  const slots: ReasonSlot[] = [...PREDEFINED_LEAVE_REASONS, CUSTOM_REASON];
  const rows: ReasonSlot[][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    rows.push(slots.slice(i, i + 2));
  }
  return rows;
})();

export type AddLeaveEntryModalProps = Readonly<{
  visible: boolean;
  /** When set, form is seeded for editing and save keeps this id. */
  editingEntry: LeaveEntry | null;
  onRequestDismiss: () => void;
  onSave: (entry: LeaveEntry) => void | Promise<void>;
}>;

function isValidCustomReason(raw: string): boolean {
  return raw.trim().length >= 3;
}

export function AddLeaveEntryModal({
  visible,
  editingEntry,
  onRequestDismiss,
  onSave,
}: AddLeaveEntryModalProps) {
  const { theme } = useUnistyles();
  const { height: windowHeight } = useWindowDimensions();
  const modalShellHeight = Math.round(windowHeight * 0.88);
  const [selectedAt, setSelectedAt] = useState(() =>
    startOfLocalCalendarDay(new Date()),
  );
  const [duration, setDuration] = useState<LeaveDurationKind>('full_day');
  const [reasonChoice, setReasonChoice] = useState<string>(
    PREDEFINED_LEAVE_REASONS[0],
  );
  const [customReason, setCustomReason] = useState('');
  const [customTouched, setCustomTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(visible);
  const bodyScrollRef = useRef<ScrollView>(null);
  const reducedMotion = useReducedMotion();
  const visibility = useSharedValue(visible ? 1 : 0);

  const hideModalOnJsThread = useCallback(() => {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      visibility.value = withTiming(1, {
        duration: reducedMotion ? 100 : 220,
      });
      return;
    }
    visibility.value = withTiming(
      0,
      { duration: reducedMotion ? 90 : 170 },
      finished => {
        if (finished) {
          runOnJS(hideModalOnJsThread)();
        }
      },
    );
  }, [hideModalOnJsThread, reducedMotion, visibility, visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(visibility.value, [0, 1], [0, 1]),
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: [
      { translateY: interpolate(visibility.value, [0, 1], [18, 0]) },
      { scale: interpolate(visibility.value, [0, 1], [0.98, 1]) },
    ],
  }));

  useEffect(() => {
    if (visible) {
      if (editingEntry) {
        setSelectedAt(startOfLocalCalendarDay(editingEntry.at));
        setDuration(editingEntry.duration);
        const predefined = PREDEFINED_LEAVE_REASONS.find(
          r => r === editingEntry.reason,
        );
        if (predefined) {
          setReasonChoice(predefined);
          setCustomReason('');
        } else {
          setReasonChoice(CUSTOM_REASON);
          setCustomReason(editingEntry.reason);
        }
        setCustomTouched(false);
      } else {
        setSelectedAt(startOfLocalCalendarDay(new Date()));
        setDuration('full_day');
        setReasonChoice(PREDEFINED_LEAVE_REASONS[0]);
        setCustomReason('');
        setCustomTouched(false);
      }
      setSubmitting(false);
    }
  }, [visible, editingEntry]);

  const selectedDayKey = useMemo(
    () => getLocalCalendarDayKey(selectedAt),
    [selectedAt],
  );

  const todayKey = getLocalCalendarDayKey(new Date());

  const markedDates = useMemo(
    () => ({
      [selectedDayKey]: {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: theme.colors.primaryForeground,
      },
    }),
    [selectedDayKey, theme.colors.primary, theme.colors.primaryForeground],
  );

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: theme.colors.card,
      backgroundColor: theme.colors.card,
      dayTextColor: theme.colors.foreground,
      textDayFontWeight: '400' as const,
      monthTextColor: theme.colors.foreground,
      textMonthFontWeight: '600' as const,
      textSectionTitleColor: theme.colors.mutedForeground,
      selectedDayBackgroundColor: theme.colors.primary,
      selectedDayTextColor: theme.colors.primaryForeground,
      todayTextColor: theme.colors.primary,
      todayBackgroundColor: theme.colors.muted,
      arrowColor: theme.colors.foreground,
      textDisabledColor: theme.colors.mutedForeground,
      textInactiveColor: theme.colors.mutedForeground,
    }),
    [theme.colors],
  );

  const isCustom = reasonChoice === CUSTOM_REASON;

  useEffect(() => {
    if (!visible || !isCustom) {
      return;
    }
    const t = setTimeout(() => {
      bodyScrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(t);
  }, [isCustom, visible]);

  const customOk = isValidCustomReason(customReason);
  const customError =
    isCustom && customTouched && !customOk
      ? 'Enter at least 3 characters.'
      : null;
  const isFutureDay = selectedDayKey > todayKey;
  const saveDisabled =
    submitting || (isCustom && !customOk) || isFutureDay;

  const onDayPress = useCallback(
    (d: DateData) => {
      if (d.dateString > todayKey) {
        return;
      }
      setSelectedAt(
        startOfLocalCalendarDay(new Date(d.year, d.month - 1, d.day)),
      );
    },
    [todayKey],
  );

  const handleSave = useCallback(async () => {
    if (isCustom) {
      setCustomTouched(true);
      if (!isValidCustomReason(customReason)) {
        return;
      }
    }
    if (selectedDayKey > todayKey) {
      return;
    }
    const reason = isCustom ? customReason.trim() : reasonChoice;
    const entry: LeaveEntry = {
      id: editingEntry?.id ?? createLeaveId(),
      at: selectedAt,
      duration,
      reason,
    };
    setSubmitting(true);
    try {
      await Promise.resolve(onSave(entry));
    } finally {
      setSubmitting(false);
    }
  }, [
    customReason,
    duration,
    isCustom,
    onSave,
    reasonChoice,
    selectedAt,
    selectedDayKey,
    todayKey,
    editingEntry,
  ]);

  return (
    <Modal
      animationType="none"
      onRequestClose={onRequestDismiss}
      transparent
      visible={mounted}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}>
        <View style={styles.overlay}>
          <AnimatedPressable
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
            onPress={onRequestDismiss}
            style={[styles.backdrop, backdropAnimatedStyle]}
          />
          <Animated.View
            pointerEvents="box-none"
            style={[styles.modalCardShell, { height: modalShellHeight }, cardAnimatedStyle]}>
            <Card
              style={styles.modalCard}
              title={editingEntry == null ? 'Add leave' : 'Edit leave'}>
              <ScrollView
                ref={bodyScrollRef}
                contentContainerStyle={styles.modalBodyScrollContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={styles.modalBodyScroll}>
                <View style={styles.fieldBlock}>
                  <View style={styles.calendarCard}>
                    <Calendar
                      current={selectedDayKey}
                      enableSwipeMonths
                      markedDates={markedDates}
                      maxDate={todayKey}
                      onDayPress={onDayPress}
                      theme={calendarTheme}
                    />
                  </View>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Leave type</Text>
                  <View
                    accessibilityRole="radiogroup"
                    style={styles.radioGroup}>
                    {LEAVE_TYPE_OPTIONS.map(opt => {
                      const selected = duration === opt.value;
                      return (
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          key={opt.value}
                          onPress={() => setDuration(opt.value)}
                          style={styles.radioRow}>
                          <View
                            style={[
                              styles.radioOuter,
                              selected && styles.radioOuterSelected,
                            ]}>
                            {selected ? <View style={styles.radioInner} /> : null}
                          </View>
                          <Text style={styles.radioLabel}>{opt.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Reason</Text>
                  <View accessibilityRole="radiogroup" style={styles.reasonGrid}>
                    {REASON_GRID_ROWS.map(row => (
                      <View
                        key={row
                          .map(s => (s === CUSTOM_REASON ? 'custom' : s))
                          .join('|')}
                        style={styles.reasonGridRow}>
                        {row.map(slot => {
                          const isCustomSlot = slot === CUSTOM_REASON;
                          const labelText = isCustomSlot ? 'Custom…' : slot;
                          const selected = isCustomSlot
                            ? isCustom
                            : reasonChoice === slot;
                          return (
                            <Pressable
                              accessibilityLabel={labelText}
                              accessibilityRole="radio"
                              accessibilityState={{ selected }}
                              key={isCustomSlot ? CUSTOM_REASON : slot}
                              onPress={() => {
                                if (isCustomSlot) {
                                  setReasonChoice(CUSTOM_REASON);
                                } else {
                                  setReasonChoice(slot);
                                  setCustomTouched(false);
                                }
                              }}
                              style={styles.reasonCell}>
                              <View style={styles.radioRowInGrid}>
                                <View
                                  style={[
                                    styles.radioOuter,
                                    selected && styles.radioOuterSelected,
                                  ]}>
                                  {selected ? (
                                    <View style={styles.radioInner} />
                                  ) : null}
                                </View>
                                <Text
                                  numberOfLines={2}
                                  style={styles.radioLabelInGrid}>
                                  {labelText}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                  {isCustom ? (
                    <View style={styles.customReasonSection}>
                      <Input
                        editable={!submitting}
                        error={Boolean(customError)}
                        multiline
                        numberOfLines={6}
                        onBlur={() => setCustomTouched(true)}
                        onChangeText={t => {
                          setCustomReason(t);
                        }}
                        placeholder="Describe your reason (min. 3 characters)"
                        style={styles.customReasonTextArea}
                        textAlignVertical="top"
                        value={customReason}
                      />
                      {customError ? (
                        <Text style={styles.errorText}>{customError}</Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </ScrollView>

              <View style={styles.actions}>
                <Button
                  disabled={submitting}
                  onPress={onRequestDismiss}
                  style={styles.actionGrow}
                  variant="secondary">
                  Cancel
                </Button>
                <Button
                  disabled={saveDisabled}
                  onPress={handleSave}
                  style={styles.actionGrow}
                  variant="primary">
                  {editingEntry == null ? 'Save' : 'Update'}
                </Button>
              </View>
            </Card>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
