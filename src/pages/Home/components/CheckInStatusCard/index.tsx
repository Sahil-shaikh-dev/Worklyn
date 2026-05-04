import { Button, Card } from '../../../../components/ui';
import type { SessionPhase } from '../../../../features/attendance';
import { LogOut, Pause, Play } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { styles } from './styles';

export type CheckInStatusCardProps = Readonly<{
  sessionPhase: SessionPhase;
  sessionDateLabel?: string;
  mainTimerHms: string;
  /** Shown below main timer while on break. */
  breakTimerHms?: string | null;
  statusMessage: string;
  onClockIn: () => void;
  onStartPause: () => void;
  onResumeFromPause: () => void;
  onClockOut: () => void;
}>;

export function CheckInStatusCard({
  sessionPhase,
  sessionDateLabel,
  mainTimerHms,
  breakTimerHms,
  statusMessage,
  onClockIn,
  onStartPause,
  onResumeFromPause,
  onClockOut,
}: CheckInStatusCardProps) {
  const { theme } = useUnistyles();
  const showDate = sessionDateLabel != null && sessionDateLabel.trim() !== '';
  const showBreakTimer =
    breakTimerHms != null && breakTimerHms !== '' && sessionPhase === 'paused';

  return (
    <Card>
      <View style={styles.cardInner}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Current status</Text>
          {showDate ? (
            <Text
              accessibilityLabel={`Session date ${sessionDateLabel}`}
              numberOfLines={1}
              style={styles.sessionDate}
            >
              {sessionDateLabel}
            </Text>
          ) : null}
        </View>
        <Text style={styles.timer} accessibilityRole="text">
          {mainTimerHms}
        </Text>
        {showBreakTimer ? (
          <Text
            accessibilityLabel={`On break, ${breakTimerHms}`}
            style={styles.breakTimerGold}
          >
            On break — {breakTimerHms}
          </Text>
        ) : null}
        {sessionPhase === 'idle' || sessionPhase === 'working' ? (
          <Text style={styles.statusMessage}>{statusMessage}</Text>
        ) : null}

        {sessionPhase === 'idle' ? (
          <View style={styles.actionsSingle}>
            <Button
              accessibilityLabel="Clock in"
              onPress={onClockIn}
              style={styles.fullWidthAction}
              variant="primary"
            >
              <View style={styles.clockInRow}>
                <Play
                  color={theme.colors.primaryForeground}
                  size={22}
                  strokeWidth={2.4}
                />
                <Text style={styles.clockInLabel}>Clock In</Text>
              </View>
            </Button>
          </View>
        ) : null}

        {sessionPhase === 'working' ? (
          <View style={styles.actionsRow}>
            <Button
              accessibilityLabel="Clock out"
              onPress={onClockOut}
              style={styles.actionButton}
              variant="primaryOutline"
            >
              <View style={styles.clockOutRow}>
                <LogOut
                  color={theme.colors.primary}
                  size={22}
                  strokeWidth={2.4}
                />
                <Text style={styles.clockOutLabel}>Clock Out</Text>
              </View>
            </Button>
            <Button
              accessibilityLabel="Pause for break"
              onPress={onStartPause}
              style={styles.actionButton}
              variant="secondary"
            >
              <View style={styles.pauseRow}>
                <Pause
                  color={theme.colors.secondaryForeground}
                  size={22}
                  strokeWidth={2.4}
                />
                <Text style={styles.pauseLabel}>Pause</Text>
              </View>
            </Button>
          </View>
        ) : null}

        {sessionPhase === 'paused' ? (
          <View style={styles.actionsSingle}>
            <Button
              accessibilityLabel="Resume work timer"
              onPress={onResumeFromPause}
              style={styles.fullWidthAction}
              variant="primary"
            >
              <View style={styles.clockInRow}>
                <Play
                  color={theme.colors.primaryForeground}
                  size={22}
                  strokeWidth={2.4}
                />
                <Text style={styles.clockInLabel}>Resume</Text>
              </View>
            </Button>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
