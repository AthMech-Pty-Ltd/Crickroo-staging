import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

export interface SegmentOption {
  label: string;
  icon?: (color: string) => React.ReactNode;
}

interface SegmentedControlProps {
  options: string[] | SegmentOption[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
  variant?: 'standard' | 'dashboard';
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
  style,
  variant = 'standard',
}) => {
  const isDashboard = variant === 'dashboard';

  return (
    <View
      style={[
        styles.container,
        isDashboard && styles.dashboardContainer,
        style,
      ]}
    >
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const label = typeof option === 'string' ? option : option.label;
        const icon = typeof option === 'string' ? undefined : option.icon;
        const iconColor = isSelected
          ? colors.primary.main
          : colors.neutrals[40];

        return (
          <TouchableOpacity
            key={label}
            style={[
              styles.segment,
              isDashboard && styles.dashboardSegment,
              isSelected &&
                (isDashboard
                  ? styles.dashboardSelectedSegment
                  : styles.selectedSegment),
            ]}
            onPress={() => onChange(index)}
            activeOpacity={0.8}
          >
            <View style={styles.contentRow}>
              {icon && <View style={styles.icon}>{icon(iconColor)}</View>}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                style={[
                  styles.text,
                  isSelected ? styles.selectedText : styles.unselectedText,
                  isSelected && isDashboard && styles.dashboardSelectedText,
                ]}
              >
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
