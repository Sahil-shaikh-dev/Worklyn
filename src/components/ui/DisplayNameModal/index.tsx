import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  getDisplayNameValidationError,
  isValidDisplayName,
} from '../../../features/userProfile';
import { Button } from '../Button';
import { Card } from '../Card';
import { Input } from '../Input';
import { styles } from './styles';

export type DisplayNameModalMode = 'initial' | 'edit';

export type DisplayNameModalProps = Readonly<{
  visible: boolean;
  mode: DisplayNameModalMode;
  /** Seeds the field when the modal becomes visible. */
  initialName: string;
  onSave: (trimmedName: string) => void | Promise<void>;
  /** Cancel / backdrop (edit mode only; initial has no dismiss). */
  onRequestDismiss: () => void;
}>;

export function DisplayNameModal({
  visible,
  mode,
  initialName,
  onSave,
  onRequestDismiss,
}: DisplayNameModalProps) {
  const [draft, setDraft] = useState(initialName);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(initialName);
      setTouched(false);
      setSubmitting(false);
    }
  }, [visible, initialName]);

  const validationError =
    touched || draft.length > 0 ? getDisplayNameValidationError(draft) : null;
  const showError = touched && validationError != null;

  const handleSave = useCallback(async () => {
    setTouched(true);
    if (!isValidDisplayName(draft)) {
      return;
    }
    setSubmitting(true);
    try {
      await Promise.resolve(onSave(draft.trim()));
    } finally {
      setSubmitting(false);
    }
  }, [draft, onSave]);

  const title = mode === 'initial' ? 'What should we call you?' : 'Edit your name';
  const description =
    mode === 'initial'
      ? 'Enter a display name (at least 3 characters). You can change it later from your profile.'
      : 'Update your display name (at least 3 characters).';

  const allowBackdropDismiss = mode === 'edit';

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => {
        if (allowBackdropDismiss) {
          onRequestDismiss();
        }
      }}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel={allowBackdropDismiss ? 'Dismiss' : undefined}
            accessibilityRole="button"
            disabled={!allowBackdropDismiss}
            onPress={allowBackdropDismiss ? onRequestDismiss : undefined}
            style={styles.backdrop}
          />
          <View pointerEvents="box-none" style={styles.cardWrap}>
            <Card description={description} title={title}>
              <Text style={styles.fieldLabel}>Name</Text>
              <Input
                autoCapitalize="words"
                autoCorrect={false}
                editable={!submitting}
                error={showError}
                onChangeText={setDraft}
                onSubmitEditing={handleSave}
                placeholder="Your name"
                returnKeyType="done"
                value={draft}
              />
              {showError && validationError != null ? (
                <Text style={styles.errorText}>{validationError}</Text>
              ) : null}
              <View style={styles.actions}>
                {mode === 'edit' ? (
                  <Button
                    disabled={submitting}
                    onPress={onRequestDismiss}
                    style={styles.actionGrow}
                    variant="secondary">
                    Cancel
                  </Button>
                ) : null}
                <Button
                  disabled={submitting || !isValidDisplayName(draft)}
                  onPress={handleSave}
                  style={mode === 'edit' ? styles.actionGrow : styles.actionSingle}
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
