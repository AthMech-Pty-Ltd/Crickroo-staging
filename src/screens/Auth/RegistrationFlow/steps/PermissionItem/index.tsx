import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../../../../components/common/Button';
import { styles } from './styles';

interface PermissionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  isGranted?: boolean;
  onAllow: () => void;
}

export const PermissionItem: React.FC<PermissionItemProps> = ({
  icon,
  title,
  description,
  buttonLabel,
  isGranted = false,
  onAllow,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Button
        label={isGranted ? 'ACCESS GRANTED' : buttonLabel}
        onPress={onAllow}
        variant={isGranted ? 'primary' : 'outline_dark'}
        style={[styles.permissionButton, isGranted && styles.grantedButton]}
        textStyle={isGranted ? styles.grantedButtonText : undefined}
      />
    </View>
  );
};
