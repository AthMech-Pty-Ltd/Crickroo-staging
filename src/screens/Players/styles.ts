import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  search: {
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  joinRequestsBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinRequestsBadgeText: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals.black,
  },

  // ─── Player list card ───────────────────────────────────────────────────
  listCard: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    overflow: 'hidden',
  },

  // ─── Player row ─────────────────────────────────────────────────────────
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  playerRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },
  meta: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[70],
    marginTop: 2,
  },
  menuButton: {
    paddingHorizontal: 4,
  },

  emptyText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
    textAlign: 'center',
    marginTop: 40,
  },

  // ─── Unassigned players section ──────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeaderText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals[70],
  },
  sectionBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.neutrals[20],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBadgeText: {
    ...typography.captions.c2.semiBold,
    color: colors.neutrals[70],
  },
  listCardSpaced: {
    marginBottom: 16,
  },
  assignButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.white_05,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
