import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    padding: 16,
    gap: 16,
  },
  button: {
    height: 48,
    borderRadius: 15,
  },
  otpInfoText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
  },
  otpInfoEmail: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
  },
  editEmailText: {
    ...typography.body.b2.medium,
    color: colors.primary.main,
  },
  otpLabel: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
    marginBottom: 8,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 12,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.neutrals.black,
    borderWidth: 0.727,
    borderColor: colors.backgrounds.auth_card_border,
    color: colors.neutrals[60],
    fontSize: 20,
    fontWeight: '600',
  },
  otpBoxSuccess: {
    borderColor: colors.success.main,
    borderWidth: 1.5,
  },
  otpBoxError: {
    borderColor: colors.error[65],
    borderWidth: 1.5,
  },
  otpStatusSuccess: {
    ...typography.captions.c1.medium,
    color: colors.success.main,
    marginTop: 6,
  },
  otpStatusError: {
    ...typography.captions.c1.medium,
    color: colors.error[65],
    marginTop: 6,
  },
  resendContainer: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  resendText: {
    ...typography.body.b2.medium,
    color: colors.primary.main,
  },
  resendCooldown: {
    ...typography.body.b2.regular,
    color: colors.neutrals[40],
    textAlign: 'right',
    marginTop: 6,
  },
  eyeIconVisible: {
    opacity: 1,
  },
  eyeIconHidden: {
    opacity: 0.5,
  },
  validationContainer: {
    gap: 8,
    paddingTop: 4,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.neutrals[40],
    backgroundColor: 'transparent',
  },
  validationDotMet: {
    borderColor: colors.success.main,
    backgroundColor: colors.success.main,
  },
  validationText: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[40],
  },
  validationTextMet: {
    color: colors.success.main,
  },
});
