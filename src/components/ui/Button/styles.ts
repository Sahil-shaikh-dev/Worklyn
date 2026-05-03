import { StyleSheet } from 'react-native-unistyles';

const hitMinMd = 44;
const hitMinSm = 36;

export const styles = StyleSheet.create(theme => ({
  rootMd: {
    minHeight: hitMinMd,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  rootSm: {
    minHeight: hitMinSm,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[2],
  },

  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  destructive: {
    backgroundColor: theme.colors.destructive,
  },

  label: {
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.semibold,
  },
  labelSm: {
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.semibold,
  },

  labelPrimary: {
    color: theme.colors.primaryForeground,
  },
  labelPrimaryOutline: {
    color: theme.colors.primary,
  },
  labelSecondary: {
    color: theme.colors.secondaryForeground,
  },
  labelDestructive: {
    color: theme.colors.destructiveForeground,
  },

  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
}));
