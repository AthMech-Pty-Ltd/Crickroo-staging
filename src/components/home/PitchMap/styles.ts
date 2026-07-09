import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: colors.neutrals[20],
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
  },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.glass.white_05,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals.white,
    letterSpacing: 2,
  },
  mapWrapper: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  pitchImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFill,
  },
  ball: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutrals.white,
    borderWidth: 1,
    borderColor: colors.glass.black_50,
  },
  labelsContainer: {
    position: 'absolute',
    right: 12,
    top: 20,
    bottom: 20,
    justifyContent: 'space-around',
  },
  labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
    justifyContent: 'space-between',
  },
  labelText: {
    ...typography.captions.c2.semiBold,
    color: colors.neutrals.white,
  },
  labelTitle: {
    ...typography.captions.c2.semiBold,
    color: colors.neutrals.white,
    fontSize: 8,
    marginLeft: 4,
  },
  yorker: {
    backgroundColor: colors.primary.main,
  },
  full: {
    backgroundColor: colors.success.main,
  },
  good: {
    backgroundColor: colors.error[50],
  },
  short: {
    backgroundColor: colors.semantic.blue50,
  },
  footer: {
    padding: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  footerText: {
    ...typography.captions.c2.semiBold,
    color: colors.neutrals.white,
    letterSpacing: 1,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 12,
  },
  dot: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glass.white_10,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary.main,
  },
});
