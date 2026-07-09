import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.glass.black_60,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.neutrals.card_dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    ...typography.headers.h3.semiBold,
    color: colors.neutrals.white,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.white_10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: colors.neutrals.white,
    fontSize: 16,
  },
  search: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 32,
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    padding: 16,
  },
  playerItemSelected: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success.main,
  },
  playerInfo: {
    gap: 4,
  },
  playerName: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  playerNameDim: {
    opacity: 0.4,
  },
  playerId: {
    ...typography.body.b2.regular,
    color: colors.neutrals[50],
  },
  checkIcon: {
    width: 24,
    height: 24,
    tintColor: colors.success.main,
  },
  playerDim: {
    opacity: 0.4,
  },
  addedText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[50],
  },
  hintText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[40],
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    ...typography.body.b2.regular,
    color: colors.error[50],
    textAlign: 'center',
    marginTop: 32,
  },
  footer: {
    paddingVertical: 16,
  },
  tabs: {
    marginBottom: 16,
  },
  batchCard: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    overflow: 'hidden',
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  batchHeaderDisabled: {
    opacity: 0.45,
  },
  batchName: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  batchMeta: {
    ...typography.body.b2.regular,
    color: colors.neutrals[50],
    marginTop: 2,
  },
  batchHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
  selectAllText: {
    ...typography.body.b2.semiBold,
    color: colors.primary.main,
  },
  batchPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
});
