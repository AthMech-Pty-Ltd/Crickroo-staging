import { StyleSheet } from 'react-native';
import { colors } from '../../../../../theme/colors';
import { typography } from '../../../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    marginRight: 8,
  },
  title: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals[60],
  },
  description: {
    ...typography.body.b2.regular,
    color: colors.neutrals[40],
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    borderRadius: 12,
  },
  grantedButton: {
    backgroundColor: 'transparent',
    borderColor: colors.success.main,
    borderWidth: 1,
  },
  grantedButtonText: {
    color: colors.success.main,
  },
});
