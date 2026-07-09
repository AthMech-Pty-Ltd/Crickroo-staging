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
  content: {
    flex: 1,
    padding: 20,
  },
  instructionCard: {
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
    color: colors.neutrals[40],
    textAlign: 'left',
    width: '100%',
    lineHeight: 20,
    fontSize: 14,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  captureItem: {
    alignItems: 'center',
    gap: 12,
  },
  captureCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.neutrals.black,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 28,
    height: 28,
    tintColor: colors.neutrals[40],
  },
  captureLabel: {
    ...typography.captions.c1.medium,
    color: colors.neutrals[40],
    fontSize: 11,
  },
  permissionSection: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
  permissionSectionTitle: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionButtons: {
    gap: 12,
  },
  statusButton: {
    height: 48,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  statusButtonText: {
    ...typography.body.b2.semiBold,
  },
  allowButton: {
    borderColor: colors.primary.main,
  },
  allowButtonText: {
    color: colors.primary.main,
  },
  grantedButton: {
    borderColor: colors.success.main,
  },
  grantedButtonText: {
    color: colors.success.main,
  },
  footer: {
    padding: 20,
    paddingBottom: 20,
    backgroundColor: colors.neutrals.bg,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
  capturedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
  },
});
