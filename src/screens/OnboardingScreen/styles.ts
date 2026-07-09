import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutrals.black,
  },
  vignetteContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  verticalVignette: {
    ...StyleSheet.absoluteFillObject,
  },
  horizontalVignette: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    backgroundColor: colors.glass.black_40,
    width: 42,
    height: 42,
    borderRadius: 50,
  },
  backPlaceholder: {
    width: 42,
    height: 42,
  },
  iconImage: {
    width: 24,
    height: 24,
    tintColor: colors.neutrals.white,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressSegment: {
    width: 16,
    height: 4,
    backgroundColor: colors.glass.white_20,
    marginHorizontal: 4,
    borderRadius: 2,
  },
  activeSegment: {
    backgroundColor: colors.primary.main,
  },
  skipContainer: {
    backgroundColor: colors.glass.primary_05,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals.taupe_grey,
    letterSpacing: 1,
  },
  skipPlaceholder: {
    width: 60,
    height: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    ...typography.headers.h3.semiBold,
    color: colors.neutrals.white,
    marginBottom: 12,
  },
  brandText: {
    color: colors.primary.main,
  },
  welcomeContent: {
    paddingTop: 100,
  },
  description: {
    ...typography.body.b2.regular,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  signInContainer: {
    marginTop: 16,
    backgroundColor: colors.neutrals[30],
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInLabel: {
    ...typography.body.b2.medium,
    color: colors.neutrals.taupe_grey,
  },
  signInAction: {
    color: colors.neutrals.white,
  },
});
