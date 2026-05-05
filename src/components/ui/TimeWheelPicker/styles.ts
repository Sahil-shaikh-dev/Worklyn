import { StyleSheet } from 'react-native-unistyles';

export const ITEM_HEIGHT = 36;
export const VISIBLE_ROWS = 5;
export const SIDE_PAD_ROWS = Math.floor(VISIBLE_ROWS / 2);
export const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;

export const styles = StyleSheet.create(theme => ({
  root: {
    marginTop: theme.spacing[4],
    width: 250,
    alignSelf: 'center',
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.muted,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[2],
    maxHeight: 200,
  },
  wheelColumn: {
    flex: 1,
    minWidth: 0,
    height: WHEEL_HEIGHT,
  },
  wheelColumnNarrow: {
    flex: 0.8,
  },
  listContent: {
    paddingVertical: ITEM_HEIGHT * SIDE_PAD_ROWS,
  },
  wheelList: {
    height: WHEEL_HEIGHT,
  },
  itemWrap: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.base,
    fontWeight: theme.font.weight.medium,
    lineHeight: theme.font.lineHeight.base,
    fontVariant: ['tabular-nums'],
  },
  itemLabelSelected: {
    color: theme.colors.foreground,
    fontWeight: theme.font.weight.semibold,
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * SIDE_PAD_ROWS + theme.spacing[2],
    height: ITEM_HEIGHT,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.card,
    opacity: 0.9,
  },
  wheelDisabled: {
    opacity: 0.55,
  },
}));
