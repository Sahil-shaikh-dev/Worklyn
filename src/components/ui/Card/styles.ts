import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  title: {
    color: theme.colors.cardForeground,
    fontSize: theme.font.size.lg,
    fontWeight: theme.font.weight.semibold,
    lineHeight: theme.font.lineHeight.lg,
  },
  description: {
    color: theme.colors.mutedForeground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.normal,
    lineHeight: theme.font.lineHeight.sm,
  },
}));
