import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  /** Shared horizontal inset for clock card and timeline (matches AppHeaderBar inner padding). */
  body: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },
  /** Clock card stays outside FlatList so it does not scroll. */
  clockSection: {
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[3],
  },
  timelineList: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  listContentEmpty: {
    flex: 1,
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  /** Same empty placeholder pattern as Leaves (dashed card + icon chip + title/subtitle). */
  emptyTimeline: {
    flex: 1,
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
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
  /** Separator + spacing above summary cards (same treatment as former AttendanceSummaryFooter). */
  summaryFooterSection: {
    marginTop: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
}));
