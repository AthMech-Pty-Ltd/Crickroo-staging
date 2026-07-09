import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  baseContainer: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  primaryContainer: {
    backgroundColor: colors.primary.main,
  },
  outlineDarkContainer: {
    backgroundColor: colors.primary[15],
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  primaryDarkContainer: {
    backgroundColor: colors.primary[15],
  },
  lightContainer: {
    backgroundColor: colors.neutrals.white,
  },
  gradientContainer: {
    backgroundColor: 'transparent',
  },
  glassDarkContainer: {
    backgroundColor: colors.glass.reel_overlay,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  baseText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
    letterSpacing: 1,
  },
  primaryText: {
    color: colors.neutrals.black,
  },
  outlineDarkText: {
    color: colors.primary.main,
  },
  primaryDarkText: {
    color: colors.primary.main,
  },
  lightText: {
    color: colors.neutrals.black,
  },
  gradientText: {
    color: colors.neutrals.white,
  },
  glassDarkText: {
    color: colors.primary.main,
  },
  disabledContainer: {
    opacity: 0.38,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: 8,
  },
});
