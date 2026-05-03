import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  root: {
    marginTop: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing[2],
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    color: theme.colors.foreground,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
    fontVariant: ['tabular-nums'],
  },
  footnote: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.xs,
    lineHeight: theme.font.lineHeight.xs,
    marginTop: theme.spacing[2],
  },
}));
