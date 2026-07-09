import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 0,
    backgroundColor: colors.neutrals.deep_black,
    position: 'relative',
    minHeight: 56,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navImageIcon: {
    width: 22,
    height: 22,
    tintColor: colors.neutrals.white,
  },
  inactiveImageIcon: {
    tintColor: colors.neutrals[40],
  },
  navIcon: {
    fontSize: 24,
  },
  navText: {
    ...typography.captions.c2.medium,
    color: colors.neutrals[40],
  },
  activeNavText: {
    color: colors.neutrals.white,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 500,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutrals.black,
    shadowOffset: { width: 0, height: 9.286 },
    shadowOpacity: 0.2,
    shadowRadius: 13.929,
    elevation: 8,
  },
  fabImageIcon: {
    width: 26,
    height: 26,
    tintColor: colors.neutrals.black,
  },
});
