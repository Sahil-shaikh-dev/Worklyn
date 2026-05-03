import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  /** Full-bleed bar (border/background edge to edge). */
  shell: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  /** Row content aligned with page body (`theme.spacing[4]` horizontal inset). */
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.muted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPressed: {
    opacity: 0.85,
  },
  avatarText: {
    color: theme.colors.cardForeground,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
  },
  greeting: {
    color: theme.colors.foreground,
    fontSize: theme.font.size.lg,
    fontWeight: theme.font.weight.bold,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
}));
