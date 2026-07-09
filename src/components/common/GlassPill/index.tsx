import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { styles } from './styles';

interface GlassPillProps {
  label: string;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const GlassPill: React.FC<GlassPillProps> = ({
  label,
  active = false,
  style,
}) => {
  return (
    <View style={[styles.pill, active && styles.active, style]}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </View>
  );
};
