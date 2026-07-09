import { StyleSheet } from 'react-native';
import { colors } from '../../../../../theme/colors';
import { typography } from '../../../../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    padding: 16,
    alignItems: 'center',
    gap: 24,
  },
  instructionText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[80],
    textAlign: 'left',
    width: '100%',
    lineHeight: 20,
    fontSize: 14,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  photoWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  photoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.neutrals.black,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconImage: {
    width: 28,
    height: 28,
    tintColor: colors.neutrals[40],
    marginBottom: 4,
  },
  photoLabel: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[40],
    fontSize: 11,
  },
  continueButton: {
    fontWeight: '500',
    color: colors.neutrals[40],
  },
  capturedImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    position: 'absolute',
  },
});
