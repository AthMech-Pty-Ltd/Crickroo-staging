import { StyleSheet } from 'react-native';
import { colors } from '../../../../../theme/colors';
import { typography } from '../../../../../theme/typography';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  stepIndicatorContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stepText: {
    ...typography.captions.c1.medium,
    color: colors.primary.main,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.neutrals[20],
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
  },
  continueButton: {
    marginTop: 24,
    borderRadius: 16,
  },
});
