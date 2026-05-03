import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: theme.spacing[5],
  },
  track: {
    width: 48,
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  lineUp: {
    width: 2,
    height: theme.spacing[3],
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing[1],
  },
  lineUpPlaceholder: {
    height: theme.spacing[3],
    marginBottom: theme.spacing[1],
  },
  node: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  nodeMuted: {
    backgroundColor: theme.colors.chart2,
  },
  nodePause: {
    backgroundColor: theme.colors.pause,
  },
  lineDown: {
    width: 2,
    minHeight: theme.spacing[10],
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing[1],
  },
  lineDownPlaceholder: {
    minHeight: theme.spacing[8],
    marginTop: theme.spacing[1],
  },
  /** Right column: time chip sits above the entry card (not inside it). */
  contentColumn: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing[2],
  },
  /** Merged onto `Card` — title, description, meta; track and time chip stay outside. */
  timelineEntryCard: {
    alignSelf: 'stretch',
    padding: theme.spacing[3],
    gap: theme.spacing[2],
  },
  timeChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
  },
  timePreciseChip: {
    color: theme.colors.foreground,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.xs,
    fontVariant: ['tabular-nums'],
  },
  dateHeading: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.xs,
  },
  title: {
    color: theme.colors.foreground,
    fontSize: theme.font.size.lg,
    fontWeight: theme.font.weight.bold,
    lineHeight: theme.font.lineHeight.lg,
  },
  description: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.normal,
    lineHeight: theme.font.lineHeight.sm,
  },
  metaLine: {
    color: theme.colors.chart2,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.sm,
  },
  titlePause: {
    color: theme.colors.pauseText,
  },
  descriptionPause: {
    color: theme.colors.pauseText,
    opacity: 0.92,
  },
  metaLinePause: {
    color: theme.colors.pause,
    fontWeight: theme.font.weight.semibold,
  },
}));
