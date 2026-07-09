import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 50,
    backgroundColor: colors.glass.black_40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: colors.neutrals.white,
  },
  headerTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    padding: 16,
    gap: 16,
  },
  unitSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.neutrals.black,
    borderRadius: 8,
    padding: 2,
    alignItems: 'center',
  },
  unitOption: {
    paddingHorizontal: 10,
    paddingVertical: 6.5,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: colors.primary[15],
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  unitText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[40],
    fontSize: 11,
  },
  unitTextActive: {
    color: colors.primary.main,
  },
  heightContainer: {
    gap: 8,
  },
  heightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heightLabel: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 20,
    backgroundColor: colors.neutrals.bg,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutrals.bg,
  },
});
