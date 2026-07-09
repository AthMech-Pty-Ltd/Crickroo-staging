import React, { useState } from 'react';
import { View, TextInput, Text, ViewStyle } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  status?: 'default' | 'success' | 'error';
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  status = 'default',
  errorText,
  leftIcon,
  rightIcon,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  style,
  containerStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (status === 'error') return colors.error[50];
    if (status === 'success') return colors.success.main;
    if (isFocused) return colors.primary.main;
    return colors.neutrals.card_border_15;
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: getBorderColor() },
          isFocused && styles.focusedWrapper,
        ]}
      >
        <View style={styles.row}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            style={[
              styles.input,
              keyboardType === 'email-address' && styles.emailInput,
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.neutrals[40]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={editable}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      </View>
      {status === 'error' && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}
    </View>
  );
};
