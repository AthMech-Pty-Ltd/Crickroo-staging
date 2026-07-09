import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  // ─── Batch preview card (used in Batch Options + Delete Batch) ───────────
  batchPreviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.glass.primary_05,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  batchPreviewTitle: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  batchPreviewMeta: {
    ...typography.body.b2.regular,
    color: colors.neutrals[70],
    marginTop: 2,
  },

  // ─── Option rows (Batch Options modal) ───────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.glass.white_03,
    marginBottom: 8,
  },
  optionLabel: {
    ...typography.body.b1.medium,
    color: colors.neutrals.white,
    flex: 1,
  },

  // ─── Confirmation text (Delete Batch) ────────────────────────────────────
  confirmText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[70],
    marginBottom: 20,
  },

  // ─── Primary action (orange) and danger action (red) buttons ─────────────
  primaryButton: {
    marginTop: 8,
  },
  dangerButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.error[50],
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    ...typography.body.b2.semiBold,
    color: colors.error[50],
    letterSpacing: 1,
  },

  // ─── Player preview card (Delete / Change Batch / Player Options) ─────
  playerPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.glass.primary_05,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  playerPreviewAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  playerPreviewAvatarPlaceholder: {
    marginRight: 12,
  },
  playerPreviewInfo: {
    flex: 1,
  },
  playerPreviewName: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  playerPreviewMeta: {
    ...typography.body.b2.regular,
    color: colors.neutrals[70],
    marginTop: 2,
  },

  // ─── Form spacing ────────────────────────────────────────────────────────
  formField: {
    marginBottom: 16,
  },
  dropdownTrigger: {
    height: 56,
    paddingVertical: 0,
    backgroundColor: colors.neutrals.black,
    borderRadius: 12.719,
    borderWidth: 0.727,
    borderColor: colors.backgrounds.auth_card_border,
  },
});
