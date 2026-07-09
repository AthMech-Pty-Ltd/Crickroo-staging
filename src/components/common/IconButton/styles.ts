import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    width: 42,
    height: 42,
    borderRadius: 20,
    backgroundColor: colors.glass.white_05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  iconText: {
    fontSize: 30,
    color: colors.neutrals.white,
  },
});
