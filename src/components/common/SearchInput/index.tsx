import React from 'react';
import { View, TextInput, ViewStyle, StyleProp } from 'react-native';
import { MagnifyingGlassIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search by name...',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <MagnifyingGlassIcon
        size={20}
        color={colors.neutrals[40]}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.neutrals[40]}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};
