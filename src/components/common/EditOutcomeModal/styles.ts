import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  optionsList: {
    gap: 12,
    marginBottom: 28,
  },
  optionRow: {
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.neutrals.black,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.glass.primary_10,
  },
  optionText: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  optionTextSelected: {
    color: colors.neutrals.white,
  },
});
