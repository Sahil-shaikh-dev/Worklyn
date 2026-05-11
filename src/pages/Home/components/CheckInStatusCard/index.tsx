import { Button, Card } from '../../../../components/ui';
import type { SessionPhase } from '../../../../features/attendance';
import { LogOut, Pause, Play } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';
import { styles } from './styles';

export type CheckInStatusCardProps = Readonly<{
  sessionPhase: SessionPhase;
  sessionDateLabel?: string;
  mainTimerHms: string;
  estimatedClockOutTimeLabel?: string | null;
  hasReachedRequiredWorkHours?: boolean;
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
  estimatedClockOutTimeLabel,
  hasReachedRequiredWorkHours = false,
  breakTimerHms,
  statusMessage,
  onClockIn,
  onStartPause,
  onResumeFromPause,
  onClockOut,
}: CheckInStatusCardProps) {
  const { theme } = useUnistyles();
  const reducedMotion = useReducedMotion();
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
        {estimatedClockOutTimeLabel ? (
          <Text
            accessibilityLabel={`${
              hasReachedRequiredWorkHours
                ? 'Clock out time'
                : 'Estimated clock out time'
            } ${estimatedClockOutTimeLabel}`}
            style={
              hasReachedRequiredWorkHours
                ? styles.clockOutReadyText
                : styles.estimatedClockOut
            }
          >
            {hasReachedRequiredWorkHours
              ? 'Clock-out:'
              : 'Estimated clock-out:'}{' '}
            {estimatedClockOutTimeLabel}
          </Text>
        ) : null}
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

        <View style={styles.actionsContainer}>
          {sessionPhase === 'idle' ? (
            <Animated.View
              entering={FadeIn.duration(reducedMotion ? 110 : 200)}
              exiting={FadeOut.duration(reducedMotion ? 90 : 150)}
              style={[styles.actionsLayer, styles.actionsSingle]}
            >
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
            </Animated.View>
          ) : null}

          {sessionPhase === 'working' ? (
            <Animated.View
              entering={FadeIn.duration(reducedMotion ? 110 : 200)}
              exiting={FadeOut.duration(reducedMotion ? 90 : 150)}
              style={[styles.actionsLayer, styles.actionsRow]}
            >
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
            </Animated.View>
          ) : null}

          {sessionPhase === 'paused' ? (
            <Animated.View
              entering={FadeIn.duration(reducedMotion ? 110 : 200)}
              exiting={FadeOut.duration(reducedMotion ? 90 : 150)}
              style={[styles.actionsLayer, styles.actionsSingle]}
            >
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
            </Animated.View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
