import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

export type ButtonVariant =
  | 'primary'
  | 'outline_dark'
  | 'primary_dark'
  | 'light'
  | 'gradient'
  | 'glass_dark';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  leftIcon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline_dark':
        return {
          container: styles.outlineDarkContainer,
          text: styles.outlineDarkText,
        };
      case 'primary_dark':
        return {
          container: styles.primaryDarkContainer,
          text: styles.primaryDarkText,
        };
      case 'light':
        return { container: styles.lightContainer, text: styles.lightText };
      case 'gradient':
        return {
          container: styles.gradientContainer,
          text: styles.gradientText,
        };
      case 'glass_dark':
        return {
          container: styles.glassDarkContainer,
          text: styles.glassDarkText,
        };
      case 'primary':
      default:
        return { container: styles.primaryContainer, text: styles.primaryText };
    }
  };

  const { container, text } = getVariantStyles();

  const getActivityIndicatorColor = () => {
    switch (variant) {
      case 'primary':
      case 'light':
        return colors.neutrals.black;
      case 'glass_dark':
        return colors.primary.main;
      default:
        return colors.primary.main;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        container,
        disabled && !loading && styles.disabledContainer,
        style,
      ]}
      activeOpacity={0.7}
    >
      {variant === 'gradient' && (
        <LinearGradient
          colors={[
            colors.primary.upgrade_gradient[0],
            colors.primary.upgrade_gradient[1],
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading ? (
        <ActivityIndicator color={getActivityIndicatorColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={[styles.baseText, text, textStyle]}>
            {label.toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
