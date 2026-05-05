import { memo, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ITEM_HEIGHT, styles } from './styles';

type AmPm = 'AM' | 'PM';

type WheelColumnProps<T extends string | number> = Readonly<{
  values: readonly T[];
  selectedValue: T;
  formatLabel: (value: T) => string;
  onSelect: (value: T) => void;
  accessibilityLabel: string;
  disabled?: boolean;
  narrow?: boolean;
}>;

export type TimeWheelPickerProps = Readonly<{
  value: Date;
  onChange: (next: Date) => void;
  minuteStep?: number;
  disabled?: boolean;
}>;

function toTwelveHour(hours24: number): { hour: number; period: AmPm } {
  const period: AmPm = hours24 >= 12 ? 'PM' : 'AM';
  const modulo = hours24 % 12;
  return { hour: modulo === 0 ? 12 : modulo, period };
}

function toTwentyFourHour(hour12: number, period: AmPm): number {
  if (period === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  }
  return hour12 === 12 ? 12 : hour12 + 12;
}

function replaceTime(base: Date, hour12: number, minute: number, period: AmPm): Date {
  const next = new Date(base);
  next.setHours(toTwentyFourHour(hour12, period), minute, 0, 0);
  return next;
}

function sanitizeMinuteStep(step: number | undefined): number {
  if (step == null || !Number.isInteger(step) || step <= 0) {
    return 1;
  }
  if (step > 30) {
    return 30;
  }
  return step;
}

function nearestMinute(minute: number, step: number): number {
  const rounded = Math.round(minute / step) * step;
  if (rounded >= 60) {
    return 60 - step;
  }
  if (rounded < 0) {
    return 0;
  }
  return rounded;
}

function WheelColumnInner<T extends string | number>({
  values,
  selectedValue,
  formatLabel,
  onSelect,
  accessibilityLabel,
  disabled = false,
  narrow = false,
}: WheelColumnProps<T>) {
  const listRef = useRef<FlatList<T> | null>(null);

  const selectedIndex = useMemo(() => {
    const idx = values.indexOf(selectedValue);
    return Math.max(0, idx);
  }, [selectedValue, values]);

  useEffect(() => {
    const id = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 0);
    return () => clearTimeout(id);
  }, [selectedIndex]);

  const settleAtNearestIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const nextIndex = Math.round(offsetY / ITEM_HEIGHT);
    const bounded = Math.max(0, Math.min(values.length - 1, nextIndex));
    listRef.current?.scrollToOffset({
      offset: bounded * ITEM_HEIGHT,
      animated: true,
    });
    const selected = values[bounded];
    if (selected !== undefined && selected !== selectedValue) {
      onSelect(selected);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<T>) => {
    const isSelected = item === selectedValue;
    const index = values.indexOf(item);
    return (
      <Pressable
        accessibilityLabel={`${accessibilityLabel} ${formatLabel(item)}`}
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => {
          if (index < 0) {
            return;
          }
          listRef.current?.scrollToOffset({
            offset: index * ITEM_HEIGHT,
            animated: true,
          });
          if (item !== selectedValue) {
            onSelect(item);
          }
        }}
        style={styles.itemWrap}>
        <Text
          style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}
          numberOfLines={1}>
          {formatLabel(item)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wheelColumn, narrow && styles.wheelColumnNarrow]}>
      <FlatList
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="adjustable"
        data={values}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialNumToRender={12}
        keyExtractor={String}
        onMomentumScrollEnd={settleAtNearestIndex}
        onScrollEndDrag={settleAtNearestIndex}
        ref={listRef}
        renderItem={renderItem}
        scrollEnabled={!disabled}
        showsVerticalScrollIndicator={false}
        disableIntervalMomentum
        snapToAlignment="start"
        snapToInterval={ITEM_HEIGHT}
        style={[styles.wheelList, disabled && styles.wheelDisabled]}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const WheelColumn = memo(WheelColumnInner) as typeof WheelColumnInner;

function TimeWheelPickerInner({
  value,
  onChange,
  minuteStep = 1,
  disabled = false,
}: TimeWheelPickerProps) {
  const step = sanitizeMinuteStep(minuteStep);
  const minutes = useMemo(
    () => Array.from({ length: Math.floor(60 / step) }, (_, i) => i * step),
    [step],
  );
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const periods = useMemo(() => ['AM', 'PM'] as const, []);

  const selected = useMemo(() => {
    const currentMinute = nearestMinute(value.getMinutes(), step);
    const hourInfo = toTwelveHour(value.getHours());
    return {
      hour: hourInfo.hour,
      period: hourInfo.period,
      minute: currentMinute,
    };
  }, [step, value]);

  const updateHour = (nextHour: number) => {
    onChange(replaceTime(value, nextHour, selected.minute, selected.period));
  };
  const updateMinute = (nextMinute: number) => {
    onChange(replaceTime(value, selected.hour, nextMinute, selected.period));
  };
  const updatePeriod = (nextPeriod: AmPm) => {
    onChange(replaceTime(value, selected.hour, selected.minute, nextPeriod));
  };

  return (
    <View style={styles.root}>
      <View style={styles.wheelsRow}>
        <View pointerEvents="none" style={styles.selectionHighlight} />
        <WheelColumn
          accessibilityLabel="Hour picker"
          disabled={disabled}
          formatLabel={String}
          onSelect={updateHour}
          selectedValue={selected.hour}
          values={hours}
        />
        <WheelColumn
          accessibilityLabel="Minute picker"
          disabled={disabled}
          formatLabel={minute => String(minute).padStart(2, '0')}
          onSelect={updateMinute}
          selectedValue={selected.minute}
          values={minutes}
        />
        <WheelColumn
          accessibilityLabel="AM PM picker"
          disabled={disabled}
          formatLabel={period => period}
          narrow
          onSelect={updatePeriod}
          selectedValue={selected.period}
          values={periods}
        />
      </View>
    </View>
  );
}

export const TimeWheelPicker = memo(TimeWheelPickerInner);
