import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { styles } from './styles';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  return (
    <View style={[variant === 'dark' ? styles.darkCard : styles.card, style]}>
      {children}
    </View>
  );
};
