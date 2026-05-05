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
  /** Outer shell: fixed max height so inner Card can clip and scroll. */
  modalCardShell: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 1,
  },
  /** Card fills shell; rounded border stays fixed while body scrolls. */
  modalCard: {
    flex: 1,
    overflow: 'hidden',
  },
  modalBodyScroll: {
    flex: 1,
    minHeight: 0,
  },
  modalBodyScrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing[2],
  },
  fieldBlock: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  fieldLabel: {
    color: theme.colors.foreground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.semibold,
    marginBottom: theme.spacing[1],
  },
  calendarCard: {
    overflow: 'hidden',
    borderRadius: theme.radius.md,
  },
  radioGroup: {
    gap: theme.spacing[2],
  },
  reasonGrid: {
    gap: theme.spacing[2],
  },
  reasonGridRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  reasonCell: {
    flex: 1,
    minWidth: 0,
  },
  radioRowInGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  radioLabelInGrid: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.foreground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.normal,
    lineHeight: theme.font.lineHeight.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    flex: 1,
    color: theme.colors.foreground,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.normal,
    lineHeight: theme.font.lineHeight.sm,
  },
  customReasonSection: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[2],
  },
  customReasonTextArea: {
    minHeight: 120,
    paddingTop: theme.spacing[3],
    marginHorizontal: theme.spacing[1],
    textAlignVertical: 'top',
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.font.size.sm,
    marginTop: theme.spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    flexShrink: 0,
    marginTop: theme.spacing[2],
  },
  actionGrow: {
    flex: 1,
  },
}));
