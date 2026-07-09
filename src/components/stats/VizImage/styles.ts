import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const BALL_SIZE = 12;

export const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 1, // square — 400x400 source
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(12, 13, 13, 1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ball: {
    position: 'absolute',
    // centre the ball on its coordinate
    marginLeft: -BALL_SIZE / 2,
    marginTop: -BALL_SIZE / 2,
  },
  dot: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    marginLeft: -BALL_SIZE / 2,
    marginTop: -BALL_SIZE / 2,
  },
  lockedBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  lockedDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 12, 0.12)',
  },
  lockedContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 58,
  },
  lockedLogo: {
    width: 130,
    height: 28,
    marginBottom: 14,
  },
  lockedTitle: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 22,
    marginTop: 16,
    marginBottom: 5,
  },
  lockedDescription: {
    ...typography.body.b2.regular,
    color: colors.neutrals[80],
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  unlockButton: {
    width: 190,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockText: {
    ...typography.body.b1.medium,
    color: colors.neutrals.black,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
});
