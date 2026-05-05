import { Calendar, Clock } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { Card } from '../../../../components/ui';
import { styles } from './styles';

export type LeaveTimelineEntryProps = Readonly<{
  dateChip: string;
  /** Shown inside the card above the title (e.g. weekday + long date). */
  dateHeading: string;
  title: string;
  /** e.g. “First half” — same line as title, muted (half-day rows). */
  titleSuffix?: string;
  subtitle?: string;
  /** Why the leave was taken (shown below duration details). */
  reason?: string;
  isFirst: boolean;
  isLast: boolean;
  /** Half-day rows use teal accents, clock icon, and a softer card surface. */
  variant?: 'full' | 'half';
  /** Long-press the timeline card for edit/delete actions. */
  onLongPressCard?: () => void;
}>;

function LeaveTimelineEntryInner({
  dateChip,
  dateHeading,
  title,
  titleSuffix,
  subtitle,
  reason,
  isFirst,
  isLast,
  variant = 'full',
  onLongPressCard,
}: LeaveTimelineEntryProps) {
  const { theme } = useUnistyles();
  const nodeStyle =
    variant === 'half' ? [styles.node, styles.nodeHalf] : styles.node;
  const lineUpStyle =
    variant === 'half' ? [styles.lineUp, styles.lineAccentHalf] : styles.lineUp;
  const lineDownStyle =
    variant === 'half'
      ? [styles.lineDown, styles.lineAccentHalf]
      : styles.lineDown;
  const dateChipStyle =
    variant === 'half'
      ? [styles.dateChip, styles.dateChipHalf]
      : [styles.dateChip, styles.dateChipFull];
  const cardStyle =
    variant === 'half'
      ? [styles.timelineEntryCard, styles.timelineEntryCardHalf]
      : [styles.timelineEntryCard, styles.timelineEntryCardFull];

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        {isFirst ? (
          <View style={styles.lineUpPlaceholder} />
        ) : (
          <View style={lineUpStyle} />
        )}
        <View style={nodeStyle}>
          {variant === 'half' ? (
            <Clock color={theme.colors.primaryForeground} size={18} strokeWidth={2.2} />
          ) : (
            <Calendar color={theme.colors.primaryForeground} size={18} strokeWidth={2.2} />
          )}
        </View>
        {isLast ? (
          <View style={styles.lineDownPlaceholder} />
        ) : (
          <View style={lineDownStyle} />
        )}
      </View>
      <View style={styles.contentColumn}>
        <View style={dateChipStyle}>
          <Text style={styles.dateChipText}>{dateChip}</Text>
        </View>
        <Pressable
          accessibilityHint="Opens actions to edit or delete this leave"
          accessibilityRole="button"
          delayLongPress={450}
          disabled={onLongPressCard == null}
          onLongPress={onLongPressCard}
          style={({ pressed }) => [
            onLongPressCard != null && pressed ? styles.cardPressablePressed : null,
          ]}>
          <Card style={cardStyle}>
            {dateHeading === '' ? null : (
              <Text style={styles.dateHeading}>{dateHeading}</Text>
            )}
            <Text style={styles.title}>
              {title}
              {titleSuffix != null && titleSuffix !== '' ? (
                <Text style={styles.titleSuffix}>{` · ${titleSuffix}`}</Text>
              ) : null}
            </Text>
            {subtitle != null && subtitle !== '' ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : null}
            {reason != null && reason !== '' ? (
              <View style={styles.reasonBlock}>
                <Text style={styles.reasonLabel}>Reason</Text>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ) : null}
          </Card>
        </Pressable>
      </View>
    </View>
  );
}

export const LeaveTimelineEntry = memo(LeaveTimelineEntryInner);
