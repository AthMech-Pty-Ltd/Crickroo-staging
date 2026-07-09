import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';

export const styles = StyleSheet.create({
  list: {
    maxHeight: 420,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },
  meta: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[70],
    marginTop: 2,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: colors.glass.white_05,
  },
  approveButton: {
    backgroundColor: colors.glass.white_05,
  },
});
