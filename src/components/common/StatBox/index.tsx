import React, { useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { styles } from './styles';
import LockImage from '../../../assets/images/lock.svg';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const EASE_OUT = Easing.out(Easing.cubic);

const localStyles = StyleSheet.create({
  inputReset: { padding: 0, margin: 0, textAlignVertical: 'auto' },
});

// Parses "2h 30m", "1h", "45m" → total minutes. Returns null for anything else.
const parseTimeMinutes = (str: string): number | null => {
  const full = str.match(/^(\d+)h\s*(\d+)m$/);
  if (full) return parseInt(full[1], 10) * 60 + parseInt(full[2], 10);
  const hoursOnly = str.match(/^(\d+)h$/);
  if (hoursOnly) return parseInt(hoursOnly[1], 10) * 60;
  const minsOnly = str.match(/^(\d+)m$/);
  if (minsOnly) return parseInt(minsOnly[1], 10);
  return null;
};

interface StatBoxProps {
  label: string;
  value: string | number;
  variant?: 'summary' | 'grid';
  style?: StyleProp<ViewStyle>;
  animateEntry?: boolean;
  delay?: number;
  locked?: boolean;
  onLockedPress?: () => void;
}

export const StatBox: React.FC<StatBoxProps> = ({
  label,
  value,
  variant = 'summary',
  style,
  animateEntry = false,
  delay = 0,
  locked = false,
  onLockedPress,
}) => {
  const strValue = String(value);
  const numValue = parseInt(strValue, 10);
  const isNumeric = !isNaN(numValue) && strValue === String(numValue);
  const totalMins = isNumeric ? null : parseTimeMinutes(strValue);
  const isTime = totalMins !== null;

  // Single 0→1 progress drives scale, opacity, translateY, and count-up.
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!animateEntry) return;
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: EASE_OUT }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: progress.value },
      { translateY: (1 - progress.value) * 28 },
    ],
  }));

  const animatedProps = useAnimatedProps(() => {
    const p = progress.value;

    if (isNumeric) {
      // Plain number: count up 0 → numValue
      const current = Math.round(p * numValue);
      return { text: String(current), defaultValue: String(current) };
    }

    if (isTime) {
      // Time string: count total minutes up, format as "Xh Ym"
      const currentMins = Math.round(p * totalMins!);
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const formatted = h > 0 ? `${h}h ${m}m` : `${m}m`;
      return { text: formatted, defaultValue: formatted };
    }

    // Fallback: static text, still benefits from scale/opacity animation
    return { text: strValue, defaultValue: strValue };
  });

  const boxStyle = variant === 'summary' ? styles.summaryBox : styles.gridItem;
  const labelStyle =
    variant === 'summary' ? styles.summaryLabel : styles.gridLabel;
  const valueStyle =
    variant === 'summary' ? styles.summaryValue : styles.gridValue;

  if (locked && onLockedPress) {
    return (
      <TouchableOpacity
        style={[boxStyle, style]}
        onPress={onLockedPress}
        activeOpacity={0.7}
      >
        <Text style={labelStyle} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
        <LockImage width={26} height={26} />
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[boxStyle, style, animateEntry ? animStyle : undefined]}
    >
      <Text style={labelStyle} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
      {locked ? (
        <LockImage width={26} height={26} />
      ) : animateEntry ? (
        <AnimatedTextInput
          style={[valueStyle, localStyles.inputReset]}
          animatedProps={animatedProps}
          editable={false}
          caretHidden
          underlineColorAndroid="transparent"
          selectTextOnFocus={false}
        />
      ) : (
        <Text style={valueStyle}>{value}</Text>
      )}
    </Animated.View>
  );
};
