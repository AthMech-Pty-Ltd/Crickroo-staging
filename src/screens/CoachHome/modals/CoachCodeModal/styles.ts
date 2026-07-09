import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';

export const styles = StyleSheet.create({
  description: {
    ...typography.body.b2.regular,
    color: colors.neutrals[70],
    marginBottom: 16,
  },
  codeBox: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.neutrals.black,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeText: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    letterSpacing: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
