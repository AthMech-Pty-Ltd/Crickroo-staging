import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// Width reserved on the left for the "Balls" title + the y-axis tick labels.
export const AXIS_GUTTER = 40;

export const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 1, // square — matches the image viz cards in the pager
    // darker than the surrounding card so the chart reads as a defined panel
    backgroundColor: 'rgba(12, 13, 13, 1)',
    borderRadius: 15,
    padding: 12,
    overflow: 'hidden',
  },
  plotRow: {
    flex: 1,
    flexDirection: 'row',
  },
  ballsAxis: {
    width: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  axisTitleVertical: {
    ...typography.captions.c2.medium,
    color: colors.neutrals[50],
    width: 60,
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  yAxis: {
    width: AXIS_GUTTER - 14,
  },
  yLabel: {
    position: 'absolute',
    right: 4,
    fontSize: 10,
    color: colors.neutrals[50],
  },
  plot: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: colors.neutrals[20],
  },
  gridline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.neutrals[20],
  },
  barsRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '55%',
    maxWidth: 32,
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barValue: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals.white,
    marginBottom: 4,
  },
  xRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  xSpacer: {
    width: AXIS_GUTTER,
  },
  xLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    color: colors.neutrals[50],
  },
  xTitle: {
    ...typography.captions.c2.medium,
    color: colors.neutrals[60],
    textAlign: 'center',
    marginLeft: AXIS_GUTTER,
    marginTop: 6,
  },
  lockedBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  lockedDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 12, 0.08)',
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
