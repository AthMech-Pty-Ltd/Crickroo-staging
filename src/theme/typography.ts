import { TextStyle } from 'react-native';

const sfProBold = (fontSize: number, lineHeight: number): TextStyle => ({
  fontSize,
  lineHeight,
  fontWeight: '700',
});

const manropeRegular = (fontSize: number, lineHeight: number): TextStyle => ({
  fontSize,
  lineHeight,
  fontFamily: 'Manrope-Regular',
  fontWeight: '400',
});

export const typography = {
  headers: {
    h1: {
      semiBold: sfProBold(32, 40),
      medium: sfProBold(32, 40),
    },
    h2: {
      semiBold: sfProBold(28, 36),
      medium: sfProBold(28, 36),
    },
    h3: {
      semiBold: sfProBold(24, 32),
      medium: sfProBold(24, 32),
    },
    h4: {
      semiBold: sfProBold(20, 28),
      medium: sfProBold(20, 28),
      regular: sfProBold(20, 28),
    },
  },
  body: {
    b1: {
      semiBold: manropeRegular(16, 24),
      medium: manropeRegular(16, 24),
      regular: manropeRegular(16, 24),
    },
    b2: {
      semiBold: manropeRegular(14, 20),
      medium: manropeRegular(14, 20),
      regular: manropeRegular(14, 20),
    },
  },
  captions: {
    c1: {
      semiBold: manropeRegular(12, 16),
      medium: manropeRegular(12, 16),
      regular: manropeRegular(12, 16),
    },
    c2: {
      semiBold: manropeRegular(10, 14),
      medium: manropeRegular(10, 14),
    },
  },
} as const;

export type ThemeTypography = typeof typography;
