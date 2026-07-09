import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2; // 16px padding each side + 12px gap

export const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: colors.neutrals[20],
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  leftColumn: {
    gap: 0, // We'll handle gap manually if needed, or use a container
  },
  badge: {
    backgroundColor: colors.neutrals.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 500,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 4, // Gap between solo/group and ball box
  },
  badgeText: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals.black,
  },
  ballCountBadge: {
    backgroundColor: colors.glass.black_40,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 500,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  ballIcon: {
    width: 14,
    height: 14,
    tintColor: colors.neutrals.white,
  },
  ballCountText: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals.white,
  },
  favButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favIcon: {
    width: 24,
    height: 24,
  },
  vignetteWrapper: {
    ...StyleSheet.absoluteFill,
    borderRadius: 15,
    overflow: 'hidden',
  },
  vignette: {
    ...StyleSheet.absoluteFill,
  },
  vignetteContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 10,
    paddingTop: 40,
  },
  title: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[70],
  },
});
