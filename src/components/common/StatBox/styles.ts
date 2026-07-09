import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  summaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    width: '31%',
    height: 82,
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
    marginBottom: 0,
    textAlign: 'center',
    width: '100%',
  },
  summaryValue: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    textAlign: 'center',
    width: '100%',
  },

  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(10, 9, 8, 0.48)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
  },
  gridValue: {
    ...typography.headers.h3.semiBold,
    color: colors.neutrals.white,
    marginTop: 4,
  },
  gridLabel: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[60],
  },
});
