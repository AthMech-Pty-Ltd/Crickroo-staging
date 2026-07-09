import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { styles } from './styles';

interface PaginationDotsProps {
  total: number;
  currentIndex: number;
  style?: StyleProp<ViewStyle>;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  currentIndex,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === currentIndex && styles.activeDot]}
        />
      ))}
    </View>
  );
};
