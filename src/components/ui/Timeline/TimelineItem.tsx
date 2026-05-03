import { LogIn, LogOut, Pause, Play } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { Text, View } from 'react-native';
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

function timelineNodeAppearance(
  kind: TimelineKind,
  colors: { pauseForeground: string; primaryForeground: string },
) {
  switch (kind) {
    case 'pause':
      return {
        nodeStyle: [styles.node, styles.nodePause],
        iconColor: colors.pauseForeground,
      };
    case 'resume':
      return {
        nodeStyle: [styles.node, styles.nodeMuted],
        iconColor: colors.primaryForeground,
      };
    default:
      return {
        nodeStyle: styles.node,
        iconColor: colors.primaryForeground,
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
}: TimelineItemProps) {
  const { theme } = useUnistyles();
  const Icon = iconForKind(kind);
  const { nodeStyle, iconColor } = timelineNodeAppearance(kind, theme.colors);
  const isPause = kind === 'pause';

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        {isFirst ? (
          <View style={styles.lineUpPlaceholder} />
        ) : (
          <View style={styles.lineUp} />
        )}
        <View style={nodeStyle}>
          <Icon color={iconColor} size={18} strokeWidth={2.2} />
        </View>
        {isLast ? (
          <View style={styles.lineDownPlaceholder} />
        ) : (
          <View style={styles.lineDown} />
        )}
      </View>
      <View style={styles.contentColumn}>
        <View style={styles.timeChip}>
          <Text style={styles.timePreciseChip}>{timePrecise}</Text>
        </View>
        <Card style={styles.timelineEntryCard}>
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
      </View>
    </View>
  );
}

export const TimelineItem = memo(TimelineItemInner);
