import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
  /** Fixed header: remaining / used cards (not in timeline scroll). */
  summaryBlock: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  /** Only the leave history list scrolls. */
  timelineScroll: {
    flex: 1,
  },
  timelineScrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    /** Min height = viewport so empty state can flex to fill below the header cards. */
    flexGrow: 1,
  },
  sectionTitle: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.mutedForeground,
  },
  historySection: {
    gap: theme.spacing[3],
  },
  /** Only when there are no rows: stretch to fill scroll content height. */
  historySectionEmpty: {
    flex: 1,
  },
  summaryGrid: {
    gap: theme.spacing[2],
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  summaryCell: {
    flex: 1,
    minWidth: 0,
  },
  metricCard: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricCardRemaining: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.border,
  },
  metricCardUsed: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.input,
  },
  metricCardPressed: {
    opacity: 0.88,
  },
  metricLabel: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.medium,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing[2],
  },
  metricValue: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.xl,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.cardForeground,
  },
  metricValueRemaining: {
    color: theme.colors.primary,
  },
  metricValueUsed: {
    color: theme.colors.foreground,
  },
  emptyTimeline: {
    flex: 1,
    minHeight: 200,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    marginHorizontal: -theme.spacing[1],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.muted,
  },
  emptyTimelineIconWrap: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  emptyTimelineTitle: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.foreground,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  emptyTimelineSubtitle: {
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.normal,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    lineHeight: theme.font.lineHeight.sm,
    maxWidth: 280,
  },
}));
