import { LogIn, LogOut, Pause, Play } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { Card } from '../Card';
import { styles } from './styles';

export type TimelineKind = 'clock_in' | 'pause' | 'resume' | 'clock_out';

export type TimelineItemProps = Readonly<{
  kind: TimelineKind;
  dateHeading: string;
  timePrecise: string;
  title: string;
  description?: string;
  metaLine?: string;
  isFirst: boolean;
  isLast: boolean;
  children?: ReactNode;
  onLongPressCard?: () => void;
}>;

function iconForKind(kind: TimelineKind) {
  switch (kind) {
    case 'clock_in':
      return LogIn;
    case 'pause':
      return Pause;
    case 'resume':
      return Play;
    case 'clock_out':
      return LogOut;
  }
}

function timelineKindAppearance(
  kind: TimelineKind,
  colors: { pauseForeground: string; primaryForeground: string },
) {
  switch (kind) {
    case 'pause':
      return {
        cardStyle: [styles.timelineEntryCard, styles.timelineEntryCardPause],
        iconColor: colors.pauseForeground,
        lineDownStyle: [styles.lineDown, styles.lineAccentPause],
        lineUpStyle: [styles.lineUp, styles.lineAccentPause],
        nodeStyle: [styles.node, styles.nodePause],
        timeChipStyle: [styles.timeChip, styles.timeChipPause],
      };
    case 'resume':
      return {
        cardStyle: [styles.timelineEntryCard, styles.timelineEntryCardResume],
        iconColor: colors.primaryForeground,
        lineDownStyle: [styles.lineDown, styles.lineAccentResume],
        lineUpStyle: [styles.lineUp, styles.lineAccentResume],
        nodeStyle: [styles.node, styles.nodeMuted],
        timeChipStyle: [styles.timeChip, styles.timeChipResume],
      };
    default:
      return {
        cardStyle: [styles.timelineEntryCard, styles.timelineEntryCardPrimary],
        iconColor: colors.primaryForeground,
        lineDownStyle: styles.lineDown,
        lineUpStyle: styles.lineUp,
        nodeStyle: styles.node,
        timeChipStyle: [styles.timeChip, styles.timeChipPrimary],
      };
  }
}

function TimelineItemInner({
  kind,
  dateHeading,
  timePrecise,
  title,
  description,
  metaLine,
  isFirst,
  isLast,
  children,
  onLongPressCard,
}: TimelineItemProps) {
  const { theme } = useUnistyles();
  const Icon = iconForKind(kind);
  const appearance = timelineKindAppearance(kind, theme.colors);
  const isPause = kind === 'pause';

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        {isFirst ? (
          <View style={styles.lineUpPlaceholder} />
        ) : (
          <View style={appearance.lineUpStyle} />
        )}
        <View style={appearance.nodeStyle}>
          <Icon color={appearance.iconColor} size={18} strokeWidth={2.2} />
        </View>
        {isLast ? (
          <View style={styles.lineDownPlaceholder} />
        ) : (
          <View style={appearance.lineDownStyle} />
        )}
      </View>
      <View style={styles.contentColumn}>
        <View style={appearance.timeChipStyle}>
          <Text style={styles.timePreciseChip}>{timePrecise}</Text>
        </View>
        <Pressable
          delayLongPress={450}
          disabled={onLongPressCard == null}
          onLongPress={onLongPressCard}
          style={({ pressed }) =>
            onLongPressCard == null
              ? styles.timelineCardPressable
              : [styles.timelineCardPressable, pressed && styles.timelineCardPressed]
          }
        >
          <Card style={appearance.cardStyle}>
            {dateHeading === '' ? null : (
              <Text style={styles.dateHeading}>{dateHeading}</Text>
            )}
            <Text
              style={isPause ? [styles.title, styles.titlePause] : styles.title}
            >
              {title}
            </Text>
            {description != null && description !== '' ? (
              <Text
                style={
                  isPause
                    ? [styles.description, styles.descriptionPause]
                    : styles.description
                }
              >
                {description}
              </Text>
            ) : null}
            {metaLine != null && metaLine !== '' ? (
              <Text
                style={
                  isPause
                    ? [styles.metaLine, styles.metaLinePause]
                    : styles.metaLine
                }
              >
                {metaLine}
              </Text>
            ) : null}
            {children}
          </Card>
        </Pressable>
      </View>
    </View>
  );
}

export const TimelineItem = memo(TimelineItemInner);
