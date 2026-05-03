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
}));
