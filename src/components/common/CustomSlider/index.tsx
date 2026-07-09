import React, { useState } from 'react';
import {
  View,
  Text,
  ViewStyle,
  StyleProp,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { styles } from './styles';

interface CustomSliderProps {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  unitLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  onValueChange,
  min = 10,
  max = 30,
  unitLabel,
  style,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  const getPositionFromValue = (val: number) => {
    if (sliderWidth === 0) return 0;
    const ratio = (val - min) / (max - min);
    return ratio * (sliderWidth - 24); // 24 is thumb width
  };

  const getValueFromPosition = (posX: number) => {
    const ratio = Math.max(0, Math.min(1, posX / (sliderWidth - 24)));
    return Math.round(min + ratio * (max - min));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: event => {
      const { locationX } = event.nativeEvent;
      onValueChange(getValueFromPosition(locationX - 12));
    },
    onPanResponderMove: event => {
      const { locationX } = event.nativeEvent;
      onValueChange(getValueFromPosition(locationX - 12));
    },
  });

  const thumbPosition = getPositionFromValue(value);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={styles.slider}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.track} pointerEvents="none">
          <View
            style={[
              styles.activeTrack,
              { width: thumbPosition + 12 }, // Fill to center of thumb
            ]}
          />
          <View style={[styles.thumb, { left: thumbPosition }]} />
        </View>
      </View>
      {unitLabel && <Text style={styles.unitLabel}>{unitLabel}</Text>}
    </View>
  );
};
