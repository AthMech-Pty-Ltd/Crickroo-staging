import { StyleSheet } from 'react-native';
import { colors } from '../../../../../theme/colors';
import { typography } from '../../../../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  selectionList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  roleCard: {
    flexDirection: 'column',
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 14.535,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectedCard: {
    borderColor: colors.primary.main,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glass.white_05,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  iconStyle: {
    fontSize: 20,
  },
  roleInfo: {
    flex: 1,
    paddingTop: 4,
  },
  roleTitle: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
    marginBottom: 4,
    fontSize: 16,
  },
  roleDesc: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[70],
    lineHeight: 18,
    fontSize: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.neutrals[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginTop: 13,
  },
  radioSelected: {
    borderColor: colors.primary.main,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.main,
  },
  continueButton: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
  },
});
