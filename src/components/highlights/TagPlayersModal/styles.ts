import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  tabs: {
    marginBottom: 16,
  },
  search: {
    marginBottom: 16,
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    gap: 12,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutrals.black,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowSelected: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success.main,
  },
  rowText: {
    flexShrink: 1,
    gap: 4,
  },
  name: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  code: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
  },
  empty: {
    ...typography.body.b2.regular,
    color: colors.neutrals[50],
    textAlign: 'center',
    paddingVertical: 32,
  },
  doneButton: {
    marginTop: 20,
  },
});
