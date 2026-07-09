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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.backgrounds.auth_card_border,
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals[60],
    textTransform: 'uppercase',
    marginTop: 0,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
    marginBottom: 8,
  },
  segmentedControl: {
    marginBottom: 0,
  },
  dropdownTrigger: {
    backgroundColor: colors.neutrals.black,
    borderColor: colors.neutrals.card_border_15,
    borderRadius: 12,
    height: 56,
  },
  inputContainer: {
    marginTop: 0,
  },
  dropdownIconImage: {
    width: 20,
    height: 20,
    marginRight: 4,
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
