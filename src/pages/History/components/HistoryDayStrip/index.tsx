import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import type { DayStripItem } from '../../utils/calendarRange';
import {
  firstIndexToCenterDay,
  HISTORY_STRIP_INITIAL_SCROLL_INDEX,
  HISTORY_STRIP_VISIBLE_DAYS,
} from '../../utils/calendarRange';
import { styles } from './styles';

export type HistoryDayStripHandle = Readonly<{
  scrollToDayKey: (dayKey: string) => void;
}>;

export type HistoryDayStripProps = Readonly<{
  items: DayStripItem[];
  selectedDayKey: string;
  onSelectDayKey: (dayKey: string) => void;
}>;

export const HistoryDayStrip = forwardRef<
  HistoryDayStripHandle,
  HistoryDayStripProps
>(function HistoryDayStripImpl(
  { items, selectedDayKey, onSelectDayKey },
  ref,
) {
  const { theme } = useUnistyles();
  const cellHorizontalInset = theme.spacing[1];
  const { width: windowWidth } = useWindowDimensions();
  const itemWidth = useMemo(
    () =>
      Math.max(1, Math.floor(windowWidth / HISTORY_STRIP_VISIBLE_DAYS)),
    [windowWidth],
  );
  const listRef = useRef<FlatList<DayStripItem>>(null);

  const scrollToDayKey = useCallback(
    (dayKey: string) => {
      const idx = items.findIndex(i => i.dayKey === dayKey);
      if (idx < 0) {
        return;
      }
      if (items[idx]?.isDisabled) {
        return;
      }
      const first = firstIndexToCenterDay(idx);
      listRef.current?.scrollToOffset({
        animated: true,
        offset: first * itemWidth,
      });
    },
    [items, itemWidth],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToDayKey,
    }),
    [scrollToDayKey],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: itemWidth,
      offset: itemWidth * index,
      index,
    }),
    [itemWidth],
  );

  const renderItem = useCallback(
    (info: ListRenderItemInfo<DayStripItem>) => {
      const { item } = info;
      const disabled = item.isDisabled;
      const selected = !disabled && item.dayKey === selectedDayKey;
      const innerWidth = Math.max(
        44,
        itemWidth - 2 * cellHorizontalInset,
      );
      const cellStyles = [
        styles.cell,
        { width: innerWidth },
        disabled ? styles.cellFutureDisabled : null,
        item.isToday && !selected && !disabled ? styles.cellToday : null,
        selected && item.isToday ? styles.cellSelectedToday : null,
        selected && !item.isToday ? styles.cellSelected : null,
      ];

      return (
        <View
          style={[styles.cellSlot, { width: itemWidth }]}
        >
          <Pressable
            accessibilityLabel={`${item.labelWeekday} ${item.labelDay}`}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected }}
            disabled={disabled}
            onPress={() => {
              if (!disabled) {
                onSelectDayKey(item.dayKey);
              }
            }}
            style={({ pressed }) => [
              ...cellStyles,
              !disabled && pressed ? styles.cellPressed : null,
            ]}
          >
            <Text
              style={[
                styles.weekday,
                disabled && styles.weekdayDisabled,
                selected && styles.weekdaySelected,
              ]}
              numberOfLines={1}
            >
              {item.labelWeekday}
            </Text>
            <Text
              style={[
                styles.dayNum,
                disabled && styles.dayNumDisabled,
                selected && styles.dayNumSelected,
              ]}
              numberOfLines={1}
            >
              {item.labelDay}
            </Text>
          </Pressable>
        </View>
      );
    },
    [cellHorizontalInset, itemWidth, onSelectDayKey, selectedDayKey],
  );

  const keyExtractor = useCallback((item: DayStripItem) => item.id, []);

  return (
    <View>
      <FlatList
        ref={listRef}
        contentContainerStyle={styles.listContent}
        data={items}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        horizontal
        initialNumToRender={HISTORY_STRIP_VISIBLE_DAYS + 4}
        initialScrollIndex={HISTORY_STRIP_INITIAL_SCROLL_INDEX}
        keyExtractor={keyExtractor}
        onScrollToIndexFailed={({ index }) => {
          listRef.current?.scrollToOffset({
            animated: false,
            offset: firstIndexToCenterDay(index) * itemWidth,
          });
        }}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={itemWidth}
      />
    </View>
  );
});
