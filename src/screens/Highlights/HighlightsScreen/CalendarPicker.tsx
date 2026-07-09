import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  CalendarDotIcon,
  CaretDownIcon,
  CaretUpIcon,
} from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

interface CalendarPickerProps {
  selectedDate: Date;
  sessionDates?: string[];
  onDateSelect: (date: Date) => void;
}

function formatCalendarDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

function CalendarPicker({
  selectedDate,
  sessionDates = [],
  onDateSelect,
}: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDateKey = formatCalendarDate(selectedDate);
  const markedDates = sessionDates.reduce<
    Record<
      string,
      {
        customStyles?: {
          container?: {
            backgroundColor?: string;
            borderRadius?: number;
          };
          text?: {
            color: string;
            fontFamily: string;
          };
        };
        selected?: boolean;
        selectedColor?: string;
        selectedTextColor?: string;
        marked?: boolean;
        dotColor?: string;
      }
    >
  >((acc, dateKey) => {
    acc[dateKey] = {
      marked: true,
      dotColor: colors.primary.main,
      customStyles: {
        text: {
          color: colors.primary.main,
          fontFamily: 'Manrope-Regular',
        },
      },
    };
    return acc;
  }, {});

  markedDates[selectedDateKey] = {
    ...(markedDates[selectedDateKey] ?? {}),
    selected: true,
    selectedColor: colors.primary.main,
    selectedTextColor: colors.neutrals.black,
    customStyles: {
      ...(markedDates[selectedDateKey]?.customStyles ?? {}),
      container: {
        backgroundColor: colors.primary.main,
        borderRadius: 18,
      },
      text: {
        color: colors.neutrals.black,
        fontFamily: 'Manrope-Regular',
      },
    },
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.accordion}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.trigger}
          onPress={() => setIsOpen(current => !current)}
        >
          <View style={styles.iconBox}>
            <CalendarDotIcon size={22} color={colors.primary.main} />
          </View>
          <View style={styles.labelContainer}>
            <Text style={styles.title}>Filter by date</Text>
            <Text style={styles.subtitle}>Jump to any session day</Text>
          </View>
          {isOpen ? (
            <CaretUpIcon size={22} color={colors.neutrals[70]} />
          ) : (
            <CaretDownIcon size={22} color={colors.neutrals[70]} />
          )}
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.calendarContainer}>
            <Calendar
              style={styles.calendar}
              current={selectedDateKey}
              markingType="custom"
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.neutrals.card_dark,
                calendarBackground: colors.neutrals.card_dark,
                textSectionTitleColor: colors.neutrals[70],
                textSectionTitleDisabledColor: colors.neutrals[40],
                selectedDayBackgroundColor: colors.primary.main,
                selectedDayTextColor: colors.neutrals.black,
                todayTextColor: colors.primary.main,
                dayTextColor: colors.neutrals[90],
                textDisabledColor: colors.neutrals[40],
                selectedDotColor: colors.neutrals.black,
                arrowColor: colors.primary.main,
                disabledArrowColor: colors.neutrals[40],
                monthTextColor: colors.neutrals.white,
                indicatorColor: colors.primary.main,
                textDayFontFamily: 'Manrope-Regular',
                textDayHeaderFontFamily: 'Manrope-Regular',
                textDayFontWeight: '400',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '400',
                textDayFontSize: 15,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
              onDayPress={(day: any) => {
                const [year, month, date] = day.dateString
                  .split('-')
                  .map(Number);
                const pickedDate = new Date(year, month - 1, date);
                pickedDate.setHours(0, 0, 0, 0);
                onDateSelect(pickedDate);
                setIsOpen(false);
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  accordion: {
    backgroundColor: colors.neutrals.card_dark,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    borderRadius: 18,
    overflow: 'hidden',
  },
  trigger: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconBox: {
    width: 30,
    alignItems: 'flex-start',
  },
  labelContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  subtitle: {
    ...typography.body.b2.regular,
    color: colors.neutrals[70],
    marginTop: 2,
  },
  calendarContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  calendar: {
    backgroundColor: colors.neutrals.card_dark,
  },
});

export default CalendarPicker;
