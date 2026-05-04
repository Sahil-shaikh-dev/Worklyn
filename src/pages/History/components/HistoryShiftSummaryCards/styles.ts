import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  grid: {
    gap: theme.spacing[2],
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  /** Half-width cell in a two-card row. */
  cellHalf: {
    flex: 1,
    minWidth: 0,
  },
  /** Single card in a row spans full width. */
  cellFull: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing[1],
  },
  value: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.cardForeground,
  },
  valueEmpty: {
    color: theme.colors.mutedForeground,
  },
}));
