import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { CalendarDotIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles, ITEM_HEIGHT } from './styles';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear - 1950 + 1 },
  (_, i) => 1950 + i,
).reverse();

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function parseDateString(value: string): {
  day: number;
  month: number;
  year: number;
} {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return { year: y, month: m, day: d };
  }
  const today = new Date();
  return { year: today.getFullYear() - 20, month: 1, day: 1 };
}

function formatDisplay(value: string): string {
  if (!value) return '';
  const { day, month, year } = parseDateString(value);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(
    2,
    '0',
  )}/${year}`;
}

interface ColumnProps {
  data: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const Column: React.FC<ColumnProps> = ({ data, selectedIndex, onSelect }) => {
  const ref = useRef<FlatList>(null);
  const visibleIndex = useRef(selectedIndex);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.scrollToIndex({ index: selectedIndex, animated: false });
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        visibleIndex.current = viewableItems[0].index ?? visibleIndex.current;
      }
    },
    [],
  );

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, data.length - 1));
    onSelect(clamped);
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<string | number>) => (
    <View style={styles.item}>
      <Text
        style={[
          styles.itemText,
          index === selectedIndex && styles.itemTextSelected,
        ]}
      >
        {typeof item === 'number' && item < 10
          ? String(item).padStart(2, '0')
          : item}
      </Text>
    </View>
  );

  return (
    <View style={styles.column}>
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={styles.columnContent}
        initialScrollIndex={selectedIndex}
      />
    </View>
  );
};

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
}) => {
  const [visible, setVisible] = useState(false);
  const parsed = parseDateString(value);

  const [selectedDay, setSelectedDay] = useState(parsed.day);
  const [selectedMonth, setSelectedMonth] = useState(parsed.month);
  const [selectedYear, setSelectedYear] = useState(parsed.year);

  const days = Array.from(
    { length: daysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1,
  );

  const monthIndex = MONTHS.indexOf(MONTHS[selectedMonth - 1]);
  const yearIndex = YEARS.indexOf(selectedYear);
  const dayIndex = selectedDay - 1;

  const handleConfirm = () => {
    const clampedDay = Math.min(
      selectedDay,
      daysInMonth(selectedMonth, selectedYear),
    );
    const d = String(clampedDay).padStart(2, '0');
    const m = String(selectedMonth).padStart(2, '0');
    onChange(`${selectedYear}-${m}-${d}`);
    setVisible(false);
  };

  const handleOpen = () => {
    const p = parseDateString(value);
    setSelectedDay(p.day);
    setSelectedMonth(p.month);
    setSelectedYear(p.year);
    setVisible(true);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={[styles.valueText, !value && styles.placeholder]}>
          {value ? formatDisplay(value) : placeholder}
        </Text>
        <CalendarDotIcon size={20} color={colors.neutrals[40]} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Date of Birth</Text>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            {/* Day */}
            <Column
              key={`day-${selectedMonth}-${selectedYear}`}
              data={days}
              selectedIndex={Math.min(dayIndex, days.length - 1)}
              onSelect={i => setSelectedDay(i + 1)}
            />
            {/* Month */}
            <Column
              data={MONTHS}
              selectedIndex={monthIndex}
              onSelect={i => setSelectedMonth(i + 1)}
            />
            {/* Year */}
            <Column
              data={YEARS}
              selectedIndex={yearIndex}
              onSelect={i => setSelectedYear(YEARS[i])}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
