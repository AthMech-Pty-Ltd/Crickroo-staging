import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  statContainer: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  statDimmed: {
    opacity: 0.35,
  },
  ring: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
    borderRadius: 28,
    backgroundColor: 'rgba(24, 25, 24, 0.72)',
  },
  ringValue: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    color: 'rgba(255, 255, 255, 1)',
  },
  labelText: {
    ...typography.body.b2.medium,
    color: colors.neutrals[75],
    textAlign: 'center',
    width: 62,
    paddingHorizontal: 0,
    lineHeight: 19,
  },
  labelTextCompact: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Session Card
  sessionCard: {
    backgroundColor: colors.neutrals.card_dark,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals[90],
    marginBottom: 4,
  },
  sessionSubtitle: {
    ...typography.body.b2.medium,
    color: colors.neutrals[70],
    marginBottom: 6,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutrals.card_dark,
    overflow: 'hidden',
  },
  stackedAvatar: {
    marginLeft: -8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  participantsText: {
    ...typography.body.b2.medium,
    color: '#999999',
    marginLeft: 8,
    flex: 1,
  },
  duplicateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutrals.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    borderWidth: 1,
    borderColor: colors.backgrounds.auth_card_border,
    padding: 12,
  },
  duplicateIcon: {
    width: 18,
    height: 18,
    tintColor: colors.primary.main,
  },
});
