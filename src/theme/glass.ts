import { ViewStyle } from 'react-native';
import { colors } from './colors';
import { radius } from './radius';

export const glass = {
  card: {
    backgroundColor: '#1B1918B8',
    borderColor: colors.glass.white_12,
    borderWidth: 1,
    borderRadius: radius.xl,
    shadowColor: colors.neutrals.black,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 10,
  } satisfies ViewStyle,

  darkCard: {
    backgroundColor: '#111111D9',
    borderColor: colors.glass.white_08,
    borderWidth: 1,
    borderRadius: radius.xl,
    shadowColor: colors.neutrals.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  } satisfies ViewStyle,

  pill: {
    backgroundColor: colors.glass.white_08,
    borderColor: colors.glass.white_12,
    borderWidth: 1,
    borderRadius: radius.pill,
  } satisfies ViewStyle,
} as const;
