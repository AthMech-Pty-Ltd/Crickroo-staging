import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutrals.black,
    borderRadius: 12,
    padding: 4,
    height: 56,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedSegment: {
    backgroundColor: colors.primary[15],
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    paddingHorizontal: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  selectedIcon: {
    tintColor: colors.primary.main,
  },
  unselectedIcon: {
    tintColor: colors.neutrals[40],
  },
  text: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals[40],
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  selectedText: {
    color: colors.primary.main,
  },
  dashboardSelectedText: {
    color: colors.neutrals.white,
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.24)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  unselectedText: {
    color: colors.neutrals[60],
  },
  dashboardContainer: {
    backgroundColor: 'rgba(51, 20, 0, 0.5)',
    borderRadius: 18,
    height: 44,
    padding: 4,
    borderWidth: 0,
  },
  dashboardSegment: {
    borderRadius: 12,
  },
  dashboardSelectedSegment: {
    backgroundColor: '#642902',
    borderRadius: 12,
    margin: 0,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2.22 },
    shadowOpacity: 0.1,
    shadowRadius: 6.65,
    elevation: 2,
  },
});
