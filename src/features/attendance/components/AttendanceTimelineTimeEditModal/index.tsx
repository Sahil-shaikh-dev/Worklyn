import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Button, Card, TimeWheelPicker } from '../../../../components/ui';
import { formatDateHeading, type TimelineListRow } from '../..';
import { styles } from './styles';

export type AttendanceTimelineTimeEditModalProps = Readonly<{
  entry: TimelineListRow | null;
  onRequestDismiss: () => void;
  onSubmit: (
    entry: TimelineListRow,
    nextAt: Date,
  ) => Promise<Readonly<{ ok: boolean; message?: string }>> | Readonly<{ ok: boolean; message?: string }>;
}>;

export function AttendanceTimelineTimeEditModal({
  entry,
  onRequestDismiss,
  onSubmit,
}: AttendanceTimelineTimeEditModalProps) {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (entry == null) {
      setSelectedTime(null);
      setIsSaving(false);
      setErrorText(null);
      return;
    }
    setSelectedTime(new Date(entry.eventAt));
    setIsSaving(false);
    setErrorText(null);
  }, [entry]);

  if (entry == null) {
    return null;
  }

  const pickerValue = selectedTime ?? entry.eventAt;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onRequestDismiss}
      transparent
      visible={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
            onPress={onRequestDismiss}
            style={styles.backdrop}
          />
          <View pointerEvents="box-none" style={styles.cardWrap}>
            <Card
              description="Scroll to select a new time. Entry type stays unchanged."
              title="Edit entry time">
              <Text style={styles.summaryText}>
                {`${formatDateHeading(entry.eventAt)}\n${entry.title}`}
              </Text>
              <TimeWheelPicker
                minuteStep={1}
                onChange={next => {
                  setSelectedTime(next);
                  if (errorText != null) {
                    setErrorText(null);
                  }
                }}
                value={pickerValue}
              />
              {errorText != null ? (
                <Text style={styles.errorText}>{errorText}</Text>
              ) : null}
              <View style={styles.actionsRow}>
                <Button
                  disabled={isSaving}
                  onPress={onRequestDismiss}
                  size="sm"
                  style={styles.actionHalf}
                  variant="secondary">
                  Cancel
                </Button>
                <Button
                  disabled={isSaving}
                  onPress={async () => {
                    setIsSaving(true);
                    const result = await onSubmit(entry, pickerValue);
                    setIsSaving(false);
                    if (result.ok) {
                      return;
                    }
                    setErrorText(result.message ?? 'Unable to save this time.');
                  }}
                  size="sm"
                  style={styles.actionHalf}
                  variant="primary">
                  Save
                </Button>
              </View>
            </Card>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
