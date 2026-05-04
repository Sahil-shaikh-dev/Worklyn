import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listHeader: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[5],
    gap: theme.spacing[3],
  },
  stripHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  selectedFullDate: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.foreground,
  },
  backToToday: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.muted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backToTodayPressed: {
    opacity: 0.88,
  },
  backToTodayLabel: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.xs,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.primary,
  },
  timelineList: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  emptyTimeline: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.sm,
    color: theme.colors.mutedForeground,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
  },
}));
