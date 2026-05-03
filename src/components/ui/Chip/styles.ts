import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  root: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.full,
  },
  rootMd: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
  },
  rootSm: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing[2],
    minHeight: 24,
  },

  muted: {
    backgroundColor: theme.colors.muted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  label: {
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
  },
  labelSm: {
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.xs,
  },
  labelMuted: {
    color: theme.colors.mutedForeground,
  },
  labelOutline: {
    color: theme.colors.foreground,
  },

  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
}));
