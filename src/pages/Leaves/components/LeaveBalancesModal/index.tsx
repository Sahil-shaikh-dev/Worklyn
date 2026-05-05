import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Button, Card, Input } from '../../../../components/ui';
import { styles } from './styles';

export type LeaveBalancesModalProps = Readonly<{
  visible: boolean;
  remaining: number;
  used: number;
  onSave: (values: { remaining: number; used: number }) => void | Promise<void>;
  onRequestDismiss: () => void;
}>;

const HALF_LEAVE_EPS = 1e-9;

/** Accepts whole/half-day steps (0.5); negatives optional per field. */
function parseHalfLeave(
  raw: string,
  options: Readonly<{ allowNegative: boolean }>,
): { ok: true; value: number } | { ok: false } {
  const t = raw.trim();
  if (t === '') {
    return { ok: true, value: 0 };
  }
  let s = t;
  if (options.allowNegative && s.startsWith('-.')) {
    s = s.replace('-.', '-0.');
  }
  if (s.startsWith('.')) {
    s = `0${s}`;
  }
  const numericPattern = options.allowNegative
    ? /^-?\d*\.?\d*$/
    : /^\d*\.?\d*$/;
  if (!numericPattern.test(s)) {
    return { ok: false };
  }
  if ((s.match(/\./g) ?? []).length > 1) {
    return { ok: false };
  }
  const n = Number(s);
  const minAllowed = options.allowNegative ? -Number.MAX_SAFE_INTEGER : 0;
  if (
    !Number.isFinite(n) ||
    n < minAllowed ||
    n > Number.MAX_SAFE_INTEGER
  ) {
    return { ok: false };
  }
  const stepped = Math.round(n * 2) / 2;
  if (Math.abs(stepped - n) > HALF_LEAVE_EPS) {
    return { ok: false };
  }
  return { ok: true, value: stepped };
}

export function LeaveBalancesModal({
  visible,
  remaining,
  used,
  onSave,
  onRequestDismiss,
}: LeaveBalancesModalProps) {
  const [draftRemaining, setDraftRemaining] = useState(() => String(remaining));
  const [draftUsed, setDraftUsed] = useState(() => String(used));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraftRemaining(String(remaining));
      setDraftUsed(String(used));
      setSubmitting(false);
    }
  }, [visible, remaining, used]);

  const remainingParsed = parseHalfLeave(draftRemaining, { allowNegative: true });
  const usedParsed = parseHalfLeave(draftUsed, { allowNegative: false });
  const parseError =
    !remainingParsed.ok || !usedParsed.ok
      ? 'Remaining can be negative; used must be 0 or more. Both use 0.5 steps.'
      : null;

  const handleSave = useCallback(async () => {
    const r = parseHalfLeave(draftRemaining, { allowNegative: true });
    const u = parseHalfLeave(draftUsed, { allowNegative: false });
    if (!r.ok || !u.ok) {
      return;
    }
    setSubmitting(true);
    try {
      await Promise.resolve(onSave({ remaining: r.value, used: u.value }));
    } finally {
      setSubmitting(false);
    }
  }, [draftRemaining, draftUsed, onSave]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onRequestDismiss}
      transparent
      visible={visible}>
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
              description="Set an override baseline. Future add/edit/delete entries and monthly accrual update from this point."
              title="Leave balances">
              <View style={styles.fields}>
                <View>
                  <Text style={styles.fieldLabel}>Remaining leaves</Text>
                  <Input
                    editable={!submitting}
                    error={Boolean(parseError)}
                    keyboardType="decimal-pad"
                    onChangeText={setDraftRemaining}
                    placeholder="-0.5, 0, 0.5"
                    returnKeyType="next"
                    value={draftRemaining}
                  />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Used leaves</Text>
                  <Input
                    editable={!submitting}
                    error={Boolean(parseError)}
                    keyboardType="decimal-pad"
                    onChangeText={setDraftUsed}
                    onSubmitEditing={handleSave}
                    placeholder="0, 0.5, 1"
                    returnKeyType="done"
                    value={draftUsed}
                  />
                </View>
              </View>
              {parseError ? (
                <Text style={styles.errorText}>{parseError}</Text>
              ) : null}
              <View style={styles.actions}>
                <Button
                  disabled={submitting}
                  onPress={onRequestDismiss}
                  style={styles.actionGrow}
                  variant="secondary">
                  Cancel
                </Button>
                <Button
                  disabled={submitting || Boolean(parseError)}
                  onPress={handleSave}
                  style={styles.actionGrow}
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
