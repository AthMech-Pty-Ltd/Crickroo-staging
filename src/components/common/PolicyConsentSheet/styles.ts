import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  contentRoot: {
    flex: 1,
    backgroundColor: colors.neutrals.black,
    marginHorizontal: -20,
    marginBottom: -36,
    paddingBottom: 36,
  },
  introContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  introText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[80],
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 36,
    paddingBottom: 24,
  },
  contentCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  paragraph: {
    ...typography.body.b2.regular,
    color: colors.neutrals[75],
    lineHeight: 20,
  },
  bullet: {
    ...typography.body.b2.regular,
    color: colors.neutrals[75],
    lineHeight: 20,
    paddingLeft: 6,
  },
  footerContent: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.white_12,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
});
