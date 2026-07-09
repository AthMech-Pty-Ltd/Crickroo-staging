import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.white_12,
    backgroundColor: colors.neutrals.black,
  },
  buttonText: {
    color: colors.neutrals.white,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
