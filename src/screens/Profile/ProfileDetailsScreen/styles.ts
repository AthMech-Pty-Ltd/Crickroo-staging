import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 50,
    backgroundColor: colors.glass.black_40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: colors.neutrals.white,
  },
  headerTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    marginTop: 0,
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.neutrals.card_border_15,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    width: 42,
    height: 42,
    borderRadius: 50,
    backgroundColor: colors.glass.black_60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 9,
  },
  editIcon: {
    width: 24,
    height: 24,
    tintColor: colors.neutrals.white,
  },
  userName: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    marginTop: 0,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  completionCard: {
    backgroundColor: colors.backgrounds.primary_bg_dark,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary[20],
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 16,
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionLabel: {
    ...typography.body.b1.medium,
    color: colors.neutrals.white,
  },
  completionPercent: {
    ...typography.body.b1.medium,
    color: colors.neutrals.white,
  },
  progressTrack: {
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.neutrals[30],
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
    backgroundColor: colors.primary.main,
  },
  menuGroup: {
    gap: 16,
  },
  menuItem: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  loadingContainer: {
    height: 28,
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 80,
    backgroundColor: colors.glass.black_60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: colors.glass.black_60,
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: colors.neutrals.card_dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  actionSheetOption: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  actionSheetOptionText: {
    ...typography.body.b1.medium,
    color: colors.neutrals.white,
  },
  actionSheetCancelText: {
    ...typography.body.b1.medium,
    color: colors.error[50],
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: colors.neutrals.card_border_15,
    marginHorizontal: 16,
  },
});
