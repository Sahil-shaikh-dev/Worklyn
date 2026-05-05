import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  keyboardRoot: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cardWrap: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 1,
  },
  fields: {
    gap: theme.spacing[4],
  },
  fieldLabel: {
    color: theme.colors.foreground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.semibold,
    marginBottom: theme.spacing[2],
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.font.size.sm,
    marginTop: theme.spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
  },
  actionGrow: {
    flex: 1,
  },
}));
