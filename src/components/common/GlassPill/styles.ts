import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { glass } from '../../../theme/glass';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  pill: {
    ...glass.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  label: {
    ...typography.body.b2.medium,
    color: colors.neutrals[80],
  },
  activeLabel: {
    color: colors.neutrals.white,
  },
});
