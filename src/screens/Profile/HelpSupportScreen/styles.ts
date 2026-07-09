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
  headerTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  accordionCard: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  accordionTitle: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
    flex: 1,
  },
  accordionBody: {
    overflow: 'hidden',
  },
  accordionBodyInner: {
    paddingBottom: 16,
  },
  qaItem: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 4,
  },
  questionText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },
  answerText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutrals.card_border_15,
    marginHorizontal: 16,
    marginTop: 12,
  },
  // Contact Card Styles
  contactCard: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    gap: 16,
  },
  contactTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    textAlign: 'center',
  },
  contactSubtitle: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
    textAlign: 'center',
    marginTop: -8,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
    width: '100%',
  },
  emailButtonText: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.black,
  },
});
