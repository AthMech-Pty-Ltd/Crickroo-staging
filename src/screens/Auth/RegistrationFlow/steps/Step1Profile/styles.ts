import { StyleSheet } from 'react-native';
import { colors } from '../../../../../theme/colors';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
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
  phoneRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  countryCodeField: {
    flex: 0.42,
  },
  countryPickerLabel: {
    color: colors.neutrals[60],
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  countryPickerTrigger: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.neutrals.black,
    borderRadius: 12.719,
    borderWidth: 0.727,
    borderColor: colors.neutrals.card_border_15,
    paddingHorizontal: 12,
  },
  countryPickerFlag: {
    fontSize: 20,
  },
  countryPickerCode: {
    flex: 1,
    color: colors.neutrals[60],
    fontSize: 16,
  },
  countryPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.glass.black_60,
  },
  countryPickerModal: {
    maxHeight: '72%',
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    padding: 14,
  },
  countrySearchInput: {
    height: 48,
    color: colors.neutrals[60],
    backgroundColor: colors.neutrals.black,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 16,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
  },
  countryOptionFlag: {
    width: 34,
    fontSize: 22,
  },
  countryOptionTextWrap: {
    flex: 1,
  },
  countryOptionName: {
    color: colors.neutrals.white,
    fontSize: 15,
    fontWeight: '500',
  },
  countryOptionCode: {
    color: colors.neutrals[50],
    fontSize: 13,
    marginTop: 2,
  },
  countryNoResults: {
    color: colors.neutrals[50],
    textAlign: 'center',
    paddingVertical: 20,
  },
  phoneNumberField: {
    flex: 0.58,
  },
});
