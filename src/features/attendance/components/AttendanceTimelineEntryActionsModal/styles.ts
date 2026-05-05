import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  keyboardRoot: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.overlay,
  },
  cardWrap: {
    paddingHorizontal: theme.spacing[4],
  },
  summaryText: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.sm,
    marginTop: theme.spacing[1],
  },
  actionsColumn: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[2],
  },
  actionFull: {
    width: '100%',
  },
}));
