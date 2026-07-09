import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: colors.neutrals[40],
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.neutrals.white,
    ...typography.body.b2.regular,
    lineHeight:
      Platform.OS === 'android'
        ? typography.body.b2.regular.lineHeight
        : undefined,
    paddingVertical: 0,
  },
});
