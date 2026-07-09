export const colors = {
  primary: {
    main: '#FF5A1A',
    70: '#FF8A5C',
    80: '#FFB199',
    90: '#FFE1D6',
    50: '#F4511E',
    40: '#C63F12',
    30: '#8A2F12',
    20: '#5C1F0C',
    10: '#2B0E05',
    15: '#3F1508',
    upgrade_gradient: ['#FF8A5C', '#E64A19'],
  },
  success: {
    main: '#86F986',
    85: '#B6FBB6',
    65: '#55F755',
    45: '#0BDB0B',
    20: '#056105',
    bg: '#022202',
  },
  error: {
    50: '#FF0000',
    65: '#FF4D4D',
    70: '#FF6666',
    30: '#990000',
  },
  semantic: {
    blue50: '#2B0DF2',
    blue30: '#1A0891',
    blue70: '#806EF7',
    yellow50: '#F2DF0D',
    yellow30: '#918608',
    yellow25: '#797006',
    purple50: '#8B7CF6',
  },
  neutrals: {
    black: '#000000',
    bg: '#0D0D0C',
    card_bg: '#1B1918',
    card_border_15: '#282624',
    20: '#363230',
    30: '#504C49',
    40: '#6B6561',
    50: '#867E79',
    60: '#9E9894',
    70: '#B6B2AF',
    75: '#C2BFBC',
    80: '#CFCBC9',
    85: '#DBD8D7',
    90: '#E7E5E4',
    95: '#F3F2F2',
    white: '#FFFFFF',

    // New
    deep_black: '#141414',
    card_dark: '#1A1919',
    taupe_grey: '#A3978F',
  },

  // New colours
  glass: {
    white_02: '#FFFFFF05', // 2% white
    white_03: '#FFFFFF08', // 3% white
    white_05: '#FFFFFF0D', // 5% white
    white_08: '#FFFFFF14', // 8% white
    white_10: '#FFFFFF1A', // 10% white
    white_12: '#FFFFFF1E', // 12% white
    white_20: '#FFFFFF33', // 20% white
    white_30: '#FFFFFF4D', // 30% white
    white_40: '#FFFFFF66', // 40% white
    white_60: '#FFFFFF99', // 60% white
    black_00: '#00000000', // 0% black (fully transparent)
    black_30: '#0000004D', // 30% black
    black_40: '#00000066', // 40% black
    black_50: '#00000080', // 50% black
    black_60: '#00000099', // 60% black
    primary_05: '#FF5A1A0D', // 5% primary
    primary_10: '#FF5A1A1A', // 10% primary
    primary_15: '#FF5A1A26', // 15% primary
    primary_dark_50: '#3A1E0880', // 50% primary dark
    reel_overlay: '#1A0A0080', // reel button overlay
  },
  backgrounds: {
    auth_main: '#000000',
    auth_footer: '#1C1614',
    auth_card: '#2A2624CC',
    auth_card_border: '#272626',
    primary_bg_dark: '#3A1E08',
    primary_border_dark: '#542E10',
    primary_border_soft: '#4A2A1A',
  },
} as const;

export type ThemeColors = typeof colors;
