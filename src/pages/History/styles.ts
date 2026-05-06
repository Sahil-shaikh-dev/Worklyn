import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  /** Same inset as Home body + AppHeaderBar inner row (`theme.spacing[4]`). */
  body: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    /** Matches Home `clockSection` — space below header bar border. */
    paddingTop: theme.spacing[6],
  },
  /** Date row + day strip: pinned above the timeline (not scrollable). */
  dateAndStripPinned: {
    gap: theme.spacing[1],
    paddingBottom: theme.spacing[3],
  },
  stripHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
  },
  /** Summary metrics: scrolls with timeline / empty state. */
  scrollListHeader: {
    paddingBottom: theme.spacing[5],
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
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[8],
  },
  /** Grow to viewport height; plays better with FlatList + ListHeader on devices. */
  listContentEmpty: {
    flexGrow: 1,
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[8],
  },
  /** Matches Leaves empty timeline placeholder (dashed card + icon chip + title/subtitle). */
  emptyTimeline: {
    minHeight: 200,
    flexGrow: 1,
    alignSelf: 'stretch',
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
}));
