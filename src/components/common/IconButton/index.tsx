import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { styles } from './styles';

interface IconButtonProps {
  icon: string | React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<TextStyle>;
  variant?: 'default' | 'outline' | 'ghost';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  style,
  iconStyle,
  variant = 'default',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      activeOpacity={0.7}
    >
      {typeof icon === 'string' ? (
        <Text style={[styles.iconText, iconStyle]}>{icon}</Text>
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};
