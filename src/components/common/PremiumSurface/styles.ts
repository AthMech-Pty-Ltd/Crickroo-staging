import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { glass } from '../../../theme/glass';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  card: {
    ...glass.darkCard,
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  badge: {
    minWidth: 72,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.body.b2.medium,
    color: colors.neutrals.white,
  },
  preview: {
    minHeight: 230,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  previewImage: {
    borderRadius: radius.lg,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  previewContent: {
    padding: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.glass.black_50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  lockTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  lockDescription: {
    ...typography.body.b1.regular,
    color: colors.neutrals[80],
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  ctaButton: {
    minHeight: 56,
    minWidth: 230,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  ctaText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.black,
    textTransform: 'uppercase',
  },
});
