import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  base: {
    backgroundColor: theme.colors.popover,
    borderWidth: 1,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    color: theme.colors.foreground,
    fontSize: theme.font.size.base,
    minHeight: 48,
  },
  baseSm: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    fontSize: theme.font.size.sm,
    minHeight: 40,
  },
  focused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: theme.colors.destructive,
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.45,
    color: theme.colors.mutedForeground,
  },
}));
