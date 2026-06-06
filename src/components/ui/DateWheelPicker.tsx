import { useEffect, useMemo, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

type DateWheelPickerProps = {
  value?: string;
  onChange: (value: string) => void;
};

const ITEM_HEIGHT = 44;

const months = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 }
];

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function parseDate(value?: string) {
  const [day, month, year] = value?.split('/').map(Number) ?? [];
  const fallbackYear = new Date().getFullYear() - 25;

  return {
    day: Number.isFinite(day) ? day : 1,
    month: Number.isFinite(month) ? month : 1,
    year: Number.isFinite(year) ? year : fallbackYear
  };
}

function formatDate(day: number, month: number, year: number) {
  return `${pad(day)}/${pad(month)}/${year}`;
}

function WheelColumn({
  title,
  options,
  selected,
  onSelect
}: {
  title: string;
  options: { label: string; value: number }[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selected));

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.min(
      options.length - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT))
    );
    onSelect(options[nextIndex].value);
  };

  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      <View style={styles.wheelWindow}>
        <View pointerEvents="none" style={styles.selectionHighlight} />
        <ScrollView
          ref={scrollRef}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={styles.wheelContent}
          onMomentumScrollEnd={onMomentumScrollEnd}
        >
          {options.map((option) => {
            const active = option.value === selected;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => onSelect(option.value)}
                style={styles.wheelItem}
              >
                <Text style={[styles.wheelText, active && styles.activeWheelText]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export function DateWheelPicker({ value, onChange }: DateWheelPickerProps) {
  const selected = parseDate(value);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, index) => ({ label: `${currentYear - index}`, value: currentYear - index })),
    [currentYear]
  );
  const days = useMemo(
    () => Array.from({ length: daysInMonth(selected.month, selected.year) }, (_, index) => ({ label: pad(index + 1), value: index + 1 })),
    [selected.month, selected.year]
  );

  const updateDate = (next: Partial<typeof selected>) => {
    const nextDate = { ...selected, ...next };
    const maxDay = daysInMonth(nextDate.month, nextDate.year);
    onChange(formatDate(Math.min(nextDate.day, maxDay), nextDate.month, nextDate.year));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.preview}>{value || 'Select DD/MM/YYYY'}</Text>
      <View style={styles.columns}>
        <WheelColumn title="Day" options={days} selected={selected.day} onSelect={(day) => updateDate({ day })} />
        <WheelColumn title="Month" options={months} selected={selected.month} onSelect={(month) => updateDate({ month })} />
        <WheelColumn title="Year" options={years} selected={selected.year} onSelect={(year) => updateDate({ year })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: '#fff',
    padding: theme.spacing.md,
    gap: theme.spacing.md
  },
  preview: { color: theme.colors.primaryDark, fontWeight: '800', textAlign: 'center' },
  columns: { flexDirection: 'row', gap: theme.spacing.sm },
  column: { flex: 1, alignItems: 'center', gap: theme.spacing.xs },
  columnTitle: { color: theme.colors.textSecondary, fontSize: theme.typography.caption, fontWeight: '700' },
  wheelWindow: {
    width: '100%',
    height: 132,
    borderRadius: theme.radius.md,
    backgroundColor: '#F4FBF8',
    overflow: 'hidden'
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 44,
    height: ITEM_HEIGHT,
    backgroundColor: '#E3F8EE',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#BFEBD7'
  },
  wheelContent: { paddingVertical: ITEM_HEIGHT },
  wheelItem: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  wheelText: { color: theme.colors.textSecondary, fontWeight: '700' },
  activeWheelText: { color: theme.colors.textPrimary, fontSize: theme.typography.h3, fontWeight: '900' }
});
