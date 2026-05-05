import { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Button, Card } from '../../../../components/ui';
import { formatDateHeading, formatTimePrecise, type TimelineListRow } from '../..';
import { styles } from './styles';

export type AttendanceTimelineEntryActionsModalProps = Readonly<{
  entry: TimelineListRow | null;
  onRequestDismiss: () => void;
  onEditTime: (entry: TimelineListRow) => void;
  onDelete: (entry: TimelineListRow) => void;
}>;

function entrySummary(entry: TimelineListRow): string {
  return `${formatDateHeading(entry.eventAt)}\n${formatTimePrecise(entry.eventAt)}\n${entry.title}`;
}

export function AttendanceTimelineEntryActionsModal({
  entry,
  onRequestDismiss,
  onEditTime,
  onDelete,
}: AttendanceTimelineEntryActionsModalProps) {
  const handleEdit = useCallback(() => {
    if (entry != null) {
      onEditTime(entry);
    }
  }, [entry, onEditTime]);

  const handleDelete = useCallback(() => {
    if (entry != null) {
      onDelete(entry);
    }
  }, [entry, onDelete]);

  if (entry == null) {
    return null;
  }

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
              description="You can edit this entry time or remove it from your attendance timeline."
              title="Timeline entry">
              <Text style={styles.summaryText}>{entrySummary(entry)}</Text>
              <View style={styles.actionsColumn}>
                <Button onPress={handleEdit} style={styles.actionFull} variant="primary">
                  Edit time
                </Button>
                <Button
                  onPress={handleDelete}
                  style={styles.actionFull}
                  variant="destructive">
                  Delete
                </Button>
                <Button
                  onPress={onRequestDismiss}
                  style={styles.actionFull}
                  variant="secondary">
                  Cancel
                </Button>
              </View>
            </Card>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
