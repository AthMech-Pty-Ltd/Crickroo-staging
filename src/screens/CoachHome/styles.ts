import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ─── Stat cards row ──────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: 110,
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 100,
    backgroundColor: colors.neutrals.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutrals.card_bg,
  },
  statBadgeText: {
    ...typography.captions.c2.semiBold,
    color: colors.neutrals.black,
  },
  statValue: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  statLabel: {
    ...typography.body.b2.medium,
    color: colors.neutrals[70],
  },

  // ─── Search ──────────────────────────────────────────────────────────────
  search: {
    marginBottom: 16,
  },

  // ─── Action buttons ──────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },

  // ─── Batch card ──────────────────────────────────────────────────────────
  batchCard: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    overflow: 'hidden',
    marginBottom: 12,
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  batchHeaderText: {
    flex: 1,
  },
  batchTitle: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  batchCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  batchCount: {
    ...typography.body.b2.medium,
    color: colors.neutrals[70],
  },
  batchMenuButton: {
    paddingHorizontal: 4,
  },
  batchLoading: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Player row ─────────────────────────────────────────────────────────
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
  playerAvatarPlaceholder: {
    marginRight: 12,
  },
  playerAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },
  playerMeta: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[70],
    marginTop: 2,
  },
  playerActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.white_05,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body.b2.medium,
    color: colors.neutrals[70],
    textAlign: 'center',
  },
});
