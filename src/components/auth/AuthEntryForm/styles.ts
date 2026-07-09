import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 24,
    flexGrow: 1,
  },
  termsWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    marginTop: 16,
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
  inputIcon: {
    width: 20,
    height: 20,
  },
  button: {
    height: 48,
    borderRadius: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutrals[20],
  },
  dividerText: {
    ...typography.body.b2.medium,
    color: colors.neutrals[40],
    marginHorizontal: 16,
  },
  secondaryActionCard: {
    backgroundColor: colors.primary[15],
    marginHorizontal: 20,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  secondaryActionText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[50],
    fontSize: 14,
  },
  primaryText: {
    color: colors.primary.main,
    fontWeight: 'bold',
  },
  otpInfoText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
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
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    ...typography.body.b2.medium,
    color: colors.primary.main,
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
  footerTextContainer: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[50],
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 12,
  },
  footerLink: {
    color: colors.primary.main,
    fontSize: 12,
  },
  otpBoxSuccess: {
    borderColor: colors.success.main,
    borderWidth: 1.5,
  },
  otpBoxError: {
    borderColor: colors.error[65],
    borderWidth: 1.5,
  },
  otpInfoEmail: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
  },
  editEmailText: {
    ...typography.body.b2.medium,
    color: colors.primary.main,
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
});
