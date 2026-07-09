import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutrals[20],
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: colors.primary.main,
  },
});
