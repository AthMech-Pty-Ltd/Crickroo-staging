import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    padding: 16,
    marginTop: 20,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  errorText: {
    ...typography.body.b2.medium,
    color: colors.error[65],
    textAlign: 'center',
    marginTop: 16,
  },
  label: {
    ...typography.body.b2.medium,
    color: '#A0A0A8',
  },
  groupHeader: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals[75],
    letterSpacing: 1,
    marginTop: 0,
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  playerInputWrapper: {
    flex: 1,
    gap: 8,
  },
  playerInputLabel: {
    ...typography.body.b2.medium,
    color: '#A0A0A8',
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playersHeaderText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
    letterSpacing: 1,
  },
  playersCount: {
    ...typography.body.b2.regular,
    color: colors.neutrals[50],
  },
  playerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeText: {
    ...typography.body.b2.medium,
    color: colors.error[50],
  },
  playerCard: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  playerCardName: {
    ...typography.body.b2.medium,
    color: colors.neutrals.white,
  },
  playerCardId: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[50],
    marginTop: 2,
  },
  addMoreButton: {
    marginTop: 8,
  },
  addIcon: {
    width: 16,
    height: 16,
    tintColor: colors.primary.main,
  },
  addMoreText: {
    ...typography.body.b2.semiBold,
    color: colors.primary.main,
  },
});
