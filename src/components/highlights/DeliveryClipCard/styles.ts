import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const { width } = Dimensions.get('window');
// 40 for screen padding (20*2), 24 for gaps between 3 columns (12*2)
const ITEM_WIDTH = (width - 40 - 24) / 3;

export const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.neutrals[20],
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  idBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.neutrals.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 15,
  },
  idText: {
    ...typography.captions.c2.semiBold,
    fontSize: 12,
    color: colors.primary[10],
  },
  vignetteWrapper: {
    ...StyleSheet.absoluteFill,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  vignette: {
    ...StyleSheet.absoluteFill,
  },
  vignetteContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 24,
    gap: 2,
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: 12,
  },
  checkedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  resultText: {
    ...typography.captions.c1.semiBold,
    fontSize: 14,
    color: colors.neutrals[90],
  },
  detailText: {
    ...typography.captions.c2.medium,
    fontSize: 12,
    color: colors.neutrals[60],
  },
});
