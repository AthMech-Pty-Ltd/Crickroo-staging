import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  subtitle: {
    ...typography.body.b2.regular,
    color: colors.neutrals[70],
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.neutrals[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
  },
  cardMeta: {
    ...typography.captions.c1.regular,
    color: colors.neutrals[60],
    marginTop: 2,
  },
  cardBody: {
    ...typography.body.b2.regular,
    color: colors.neutrals[70],
    marginBottom: 14,
  },
  button: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rowButton: {
    flex: 1,
  },
  contactText: {
    ...typography.body.b2.semiBold,
    color: colors.primary.main,
  },
});
