import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals[40],
    marginTop: 16,
    marginBottom: 16,
    letterSpacing: 1,
  },
  searchBar: {
    marginBottom: 16,
  },
  centerContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body.b2.regular,
    color: colors.error[50],
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
    textAlign: 'center',
    marginTop: 24,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    backgroundColor: colors.glass.white_10,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
  },
  retryButtonText: {
    color: colors.neutrals.white,
  },
});
