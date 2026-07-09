import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 68,
    gap: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutrals[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: colors.neutrals.white,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    ...typography.body.b1.medium,
    color: colors.neutrals.white,
  },
  subtitle: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: colors.neutrals[40],
    marginLeft: 12,
  },
  destructiveText: {
    color: colors.error[50],
  },
});
