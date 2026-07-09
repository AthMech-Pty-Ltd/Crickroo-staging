import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wellDoneCard: {
    width: '100%',
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
  },
  checkCircle: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkIcon: {
    width: 100,
    height: 100,
    tintColor: colors.success.main,
  },
  wellDoneTitle: {
    ...typography.headers.h3.semiBold,
    color: colors.neutrals.white,
    marginBottom: 8,
  },
  wellDoneSubtitle: {
    ...typography.body.b1.regular,
    color: colors.neutrals[70],
    textAlign: 'center',
  },
  processingCard: {
    width: '100%',
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
  },
  processingTitle: {
    ...typography.body.b1.medium,
    color: colors.neutrals.white,
    marginBottom: 20,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.neutrals[20],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutrals[30],
    marginTop: 0,
    marginBottom: 16,
  },
  detectingTitle: {
    ...typography.body.b2.medium,
    color: colors.neutrals[70],
    marginBottom: 16,
  },
  infoText: {
    ...typography.body.b2.regular,
    color: colors.neutrals.white,
    lineHeight: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeButton: {
    padding: 4,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
