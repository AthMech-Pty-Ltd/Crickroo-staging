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
    paddingTop: 16,
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 14.535,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.backgrounds.auth_card_border,
  },
  roleCardActive: {
    borderColor: colors.primary.main,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals[60],
    marginBottom: 4,
  },
  roleSubtitle: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[40],
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutrals[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginTop: 2,
  },
  radioActive: {
    borderColor: colors.primary.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
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
