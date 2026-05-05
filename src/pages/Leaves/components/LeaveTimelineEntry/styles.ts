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
  /** Tints the connector next to half-day rows so the rail matches the node. */
  lineAccentHalf: {
    backgroundColor: theme.colors.chart2,
    opacity: 0.55,
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
  nodeHalf: {
    backgroundColor: theme.colors.chart2,
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
  contentColumn: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing[2],
  },
  cardPressablePressed: {
    opacity: 0.92,
  },
  timelineEntryCard: {
    alignSelf: 'stretch',
    padding: theme.spacing[3],
    gap: theme.spacing[2],
  },
  /** Full day: primary strip — reads as the stronger “whole day” block. */
  timelineEntryCardFull: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  /** Half day: softer surface + teal strip — lighter footprint than full day. */
  timelineEntryCardHalf: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.chart2,
    backgroundColor: theme.colors.muted,
  },
  dateChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
  },
  dateChipFull: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.card,
  },
  dateChipHalf: {
    borderColor: theme.colors.chart2,
    backgroundColor: theme.colors.muted,
  },
  dateChipText: {
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
  /** First/second half — same line as “Half day”, lighter than the main label. */
  titleSuffix: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.lg,
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.normal,
    lineHeight: theme.font.lineHeight.sm,
  },
  reasonBlock: {
    gap: theme.spacing[1],
    marginTop: theme.spacing[1],
  },
  reasonLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.xs,
  },
  reasonText: {
    color: theme.colors.foreground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.normal,
    lineHeight: theme.font.lineHeight.sm,
  },
}));
