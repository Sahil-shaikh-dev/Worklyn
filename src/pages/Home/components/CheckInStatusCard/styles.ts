import { Platform } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  cardInner: {
    gap: theme.spacing[4],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
  },
  statusLabel: {
    color: theme.colors.chart2,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  sessionDate: {
    color: theme.colors.chart2,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.semibold,
    lineHeight: theme.font.lineHeight.xs,
    textAlign: 'right',
    flexShrink: 1,
  },
  timer: {
    alignSelf: 'center',
    color: theme.colors.cardForeground,
    fontSize: theme.font.size['5xl'],
    fontWeight: theme.font.weight.bold,
    lineHeight: theme.font.lineHeight['5xl'],
    fontVariant: ['tabular-nums'],
    ...(Platform.OS === 'ios'
      ? { fontFamily: 'Menlo' }
      : { fontFamily: 'monospace' }),
  },
  estimatedClockOut: {
    alignSelf: 'center',
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.sm,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  clockOutReadyText: {
    alignSelf: 'center',
    color: theme.colors.destructive,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.semibold,
    lineHeight: theme.font.lineHeight.sm,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  /** On-break copy: same scale as former status line (`statusMessage`); pure gold. */
  breakTimerGold: {
    alignSelf: 'center',
    color: theme.colors.pauseGold,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.base,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    ...(Platform.OS === 'ios'
      ? { fontFamily: 'Menlo' }
      : { fontFamily: 'monospace' }),
  },
  statusMessage: {
    alignSelf: 'center',
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.normal,
    lineHeight: theme.font.lineHeight.base,
    textAlign: 'center',
  },
  /**
   * Cross-fade wrapper: phase action layers overlap absolutely so
   * exiting/entering buttons don't push each other in the column gap.
   * minHeight matches Button hit target so the card doesn't collapse.
   */
  actionsContainer: {
    position: 'relative',
    alignSelf: 'stretch',
    minHeight: 44,
  },
  actionsLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: theme.spacing[3],
  },
  actionsSingle: {
    alignSelf: 'stretch',
  },
  fullWidthAction: {
    alignSelf: 'stretch',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  clockInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  clockInLabel: {
    color: theme.colors.primaryForeground,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
  },
  pauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  pauseLabel: {
    color: theme.colors.secondaryForeground,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
  },
  clockOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  clockOutLabel: {
    color: theme.colors.primary,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
  },
}));
