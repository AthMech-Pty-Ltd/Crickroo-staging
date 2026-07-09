import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiSlashIcon } from 'phosphor-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const OfflinePlaceholder: React.FC<{ message?: string }> = ({
  message = 'App will automatically reload once internet is back.',
}) => (
  <View style={styles.container}>
    <WifiSlashIcon size={48} color={colors.neutrals[40]} weight="regular" />
    <Text style={styles.title}>No Internet Connection</Text>
    <Text style={styles.subtitle}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
    textAlign: 'center',
  },
});
