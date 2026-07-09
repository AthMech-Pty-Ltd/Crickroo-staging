import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
  },

  // ── Date bar ──────────────────────────────────────────────────────────────
  dateBarWrapper: {},
  dateBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  dateItem: {
    width: 48,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.neutrals.card_dark,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 2,
  },
  dateItemSelected: {
    borderColor: colors.primary.main,
    borderWidth: 1.1,
    backgroundColor: colors.glass.primary_15,
  },
  dateDayText: {
    ...typography.captions.c2.medium,
    color: colors.neutrals[60],
    letterSpacing: 0.5,
  },
  dateDayTextSelected: {
    color: colors.neutrals.white,
  },
  dateNumText: {
    ...typography.body.b1.regular,
    color: colors.neutrals.white,
  },
  dateNumTextSelected: {
    color: colors.neutrals.white,
  },
  monthDivider: {
    width: 34,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.neutrals.card_dark,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    paddingVertical: 13,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  monthDividerText: {
    ...typography.captions.c2.medium,
    color: colors.neutrals.white,
    transform: [{ rotate: '-90deg' }],
    letterSpacing: 0.5,
    width: 50,
    textAlign: 'center',
  },
  // ─────────────────────────────────────────────────────────────────────────
  sessionsHeader: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals[70],
    paddingHorizontal: 20,
    paddingBottom: 16,
    textTransform: 'uppercase',
  },
  playerFilter: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  playerFilterTrigger: {
    backgroundColor: colors.neutrals.card_dark,
    borderColor: colors.neutrals.card_border_15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 12,
  },
  skeletonGrid: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  staticListContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  skeletonSessionCard: {
    height: 280,
    borderRadius: 15,
    backgroundColor: colors.neutrals[20],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 120,
    backgroundColor: colors.neutrals.bg,
  },
  emptyCircle: {
    padding: 16,
    borderRadius: 500,
    backgroundColor: colors.neutrals.card_dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    width: 72,
    height: 72,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutrals[90],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    maxWidth: '70%',
  },
  createButton: {
    backgroundColor: colors.primary[10],
    width: '75%',
    maxWidth: 280,
    minWidth: 190,
    height: 48,
    borderRadius: 16,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  createButtonText: {
    ...typography.body.b1.semiBold,
    fontSize: 14,
    color: colors.primary.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutrals.bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.neutrals.bg,
  },
  errorText: {
    ...typography.body.b2.regular,
    color: colors.error[50],
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.neutrals.card_bg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error[50],
  },
  retryButtonText: {
    ...typography.body.b2.semiBold,
    color: colors.error[50],
  },
});
