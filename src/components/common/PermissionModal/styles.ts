import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.glass.black_60,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.neutrals.card_dark,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glass.white_20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body.b2.regular,
    color: colors.neutrals[50],
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.glass.white_10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutrals.card_border_15,
    marginVertical: 20,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.glass.primary_10,
    borderWidth: 1,
    borderColor: colors.backgrounds.primary_border_soft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperGranted: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success[20],
  },
  permissionText: {
    flex: 1,
    gap: 2,
  },
  permissionName: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  permissionDesc: {
    ...typography.body.b2.regular,
    color: colors.neutrals[50],
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.glass.white_08,
  },
  statusBadgeGranted: {
    backgroundColor: colors.success.bg,
  },
  statusText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[50],
  },
  footer: {
    marginTop: 8,
    gap: 10,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.black,
    letterSpacing: 0.5,
  },
  settingsButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.glass.white_08,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    ...typography.body.b1.medium,
    color: colors.neutrals[70],
    letterSpacing: 0.5,
  },
});
