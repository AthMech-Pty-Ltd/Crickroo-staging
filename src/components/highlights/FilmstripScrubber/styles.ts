import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 72,
    justifyContent: 'center',
  },
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frameButton: {
    width: 34,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass.black_60,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
  },
  frameButtonText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
    color: colors.neutrals.white,
    marginTop: -2,
  },
  strip: {
    flex: 1,
    height: 38,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.glass.black_60,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
    justifyContent: 'center',
  },
  frameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: '100%',
  },
  frameTick: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.glass.white_20,
  },
  frameTickMajor: {
    height: 24,
    width: 4,
  },

  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary.main,
    opacity: 0.28,
  },
  playheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.primary.main,
  },
  timeLabel: {
    position: 'absolute',
    top: -12,
    transform: [{ translateX: -28 }],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.glass.black_60,
    zIndex: 10,
  },
  timeLabelText: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals.white,
  },
  timeRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[75],
  },
});
