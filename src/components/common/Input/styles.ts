import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
    marginBottom: 8,
  },
  inputWrapper: {
    height: 56,
    backgroundColor: colors.neutrals.black,
    borderRadius: 12.719,
    borderWidth: 0.727,
    borderColor: colors.backgrounds.auth_card_border,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  focusedWrapper: {
    borderColor: colors.primary.main,
    backgroundColor: colors.glass.white_05,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    color: colors.neutrals[60],
    ...typography.body.b1.regular,
    lineHeight:
      Platform.OS === 'android'
        ? typography.body.b1.regular.lineHeight
        : undefined,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  emailInput: {
    includeFontPadding: false,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  errorText: {
    ...typography.captions.c1.medium,
    color: colors.error[50],
    marginTop: 4,
  },
});
