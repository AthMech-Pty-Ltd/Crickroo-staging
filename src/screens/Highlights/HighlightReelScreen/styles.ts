import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  // ── Screen container ─────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.black,
  },

  // ── Per-reel item ─────────────────────────────────────────────────────────
  reelItem: {
    overflow: 'hidden',
  },

  // ── Video / image (fills entire item) ────────────────────────────────────
  zoomableMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Gradient overlays ─────────────────────────────────────────────────────
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 360,
  },

  // ── Tap overlay (play/pause) ──────────────────────────────────────────────
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.glass.black_50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Fixed back button (rendered outside FlatList) ─────────────────────────
  backButton: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.glass.black_50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Stats row (left box + Ball Tracking button) ───────────────────────────
  statsRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsOverlay: {
    backgroundColor: colors.glass.black_40,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statSpeed: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },
  statDeviation: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[75],
    marginTop: 2,
  },

  trackingButton: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginLeft: 'auto',
  },
  trackingButtonText: {
    fontSize: 10,
  },

  // ── Right-side action icons ───────────────────────────────────────────────
  rightActions: {
    position: 'absolute',
    right: 10,
    alignItems: 'center',
    gap: 9,
  },
  actionItem: {
    alignItems: 'center',
    gap: 3,
  },
  actionIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 500,
    backgroundColor: colors.glass.black_40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    ...typography.captions.c1.medium,
    color: colors.neutrals.white,
  },

  // ── Bottom info panel ─────────────────────────────────────────────────────
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  infoWrapper: {
    marginRight: 72,
    marginBottom: 12,
  },
  ballNumber: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    marginBottom: 4,
  },
  ballDetailGroup: {
    marginBottom: 12,
    gap: 2,
  },
  ballDetail: {
    ...typography.body.b2.regular,
    color: colors.neutrals.white,
  },
  ballDetailLabel: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },
  ballDetailValue: {
    ...typography.body.b2.medium,
    color: colors.neutrals[90],
  },
  playerTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  playerTag: {
    backgroundColor: colors.glass.black_40,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
  },
  playerTagText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals.white,
  },

  // ── Notes modal ───────────────────────────────────────────────────────────
  notesModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  notesModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glass.black_50,
  },
  notesSheet: {
    maxHeight: '72%',
    backgroundColor: colors.neutrals.black,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
  },
  notesHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.neutrals[60],
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  notesTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  notesSubtitle: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[70],
    marginTop: 2,
  },
  notesCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.glass.black_40,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
  },
  notesCloseText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals.white,
  },
  notesList: {
    maxHeight: 240,
  },
  notesListContent: {
    gap: 10,
    paddingBottom: 12,
  },
  noteCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.glass.black_40,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 12,
  },
  noteCoachName: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
    flex: 1,
  },
  noteTime: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[60],
  },
  noteBody: {
    ...typography.body.b2.regular,
    color: colors.neutrals[85],
    lineHeight: 20,
  },
  emptyNotesCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: colors.glass.black_40,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
  },
  emptyNotesTitle: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
    marginBottom: 4,
  },
  emptyNotesText: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[70],
  },
  noteInputCard: {
    borderRadius: 18,
    backgroundColor: colors.glass.black_40,
    borderWidth: 1,
    borderColor: colors.glass.white_10,
    padding: 12,
  },
  noteInput: {
    minHeight: 92,
    maxHeight: 130,
    ...typography.body.b2.regular,
    color: colors.neutrals.white,
    padding: 0,
    marginBottom: 12,
  },
  saveNoteButton: {
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
  },
  saveNoteButtonDisabled: {
    opacity: 0.45,
  },
  saveNoteButtonText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },

  // ── Filmstrip scrubber ────────────────────────────────────────────────────
  filmstripContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },

  // ── Edit Outcome CTA ──────────────────────────────────────────────────────
  editButton: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginTop: 8,
  },
});
