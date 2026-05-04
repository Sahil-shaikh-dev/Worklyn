import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  listContent: {
    paddingVertical: theme.spacing[2],
  },
  /** Centers a narrower cell so adjacent days have a visible gap. */
  cellSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellToday: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.muted,
  },
  cellSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.accent,
  },
  cellSelectedToday: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.accent,
  },
  cellPressed: {
    opacity: 0.85,
  },
  cellFutureDisabled: {
    opacity: 0.5,
  },
  weekdayDisabled: {
    color: theme.colors.mutedForeground,
  },
  dayNumDisabled: {
    color: theme.colors.mutedForeground,
  },
  weekday: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
    color: theme.colors.mutedForeground,
    textTransform: 'uppercase',
  },
  weekdaySelected: {
    color: theme.colors.primary,
  },
  dayNum: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.foreground,
    marginTop: theme.spacing[1],
  },
  dayNumSelected: {
    color: theme.colors.primary,
  },
}));
