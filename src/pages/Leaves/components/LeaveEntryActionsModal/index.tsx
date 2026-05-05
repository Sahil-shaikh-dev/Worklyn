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
import {
  formatLeaveDateHeading,
  leaveDurationCopy,
  type LeaveEntry,
} from '../../leaveTimelineFormat';
import { styles } from './styles';

export type LeaveEntryActionsModalProps = Readonly<{
  /** When non-null, the modal is shown for this entry. */
  entry: LeaveEntry | null;
  onRequestDismiss: () => void;
  onEdit: (entry: LeaveEntry) => void;
  onDelete: (entry: LeaveEntry) => void;
}>;

function entrySummaryLines(entry: LeaveEntry): string {
  const copy = leaveDurationCopy(entry.duration);
  const typeLine =
    copy.titleSuffix != null && copy.titleSuffix !== ''
      ? `${copy.title} · ${copy.titleSuffix}`
      : copy.title;
  return `${formatLeaveDateHeading(entry.at)}\n${typeLine}\n${entry.reason}`;
}

export function LeaveEntryActionsModal({
  entry,
  onRequestDismiss,
  onEdit,
  onDelete,
}: LeaveEntryActionsModalProps) {
  const handleEdit = useCallback(() => {
    if (entry != null) {
      onEdit(entry);
    }
  }, [entry, onEdit]);

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
              description="Edit this leave or remove it from your history."
              title="Leave entry">
              <Text style={styles.summaryText}>{entrySummaryLines(entry)}</Text>
              <View style={styles.actionsColumn}>
                <Button
                  onPress={handleEdit}
                  style={styles.actionFull}
                  variant="primary">
                  Edit
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
