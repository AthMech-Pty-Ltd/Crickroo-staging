import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.body.b2.medium,
    color: colors.neutrals[40],
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5C493D',
    width: '100%',
    position: 'relative',
  },
  activeTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutrals.white,
    position: 'absolute',
    top: -8,
    shadowColor: colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unitLabel: {
    ...typography.body.b2.medium,
    color: colors.neutrals.white,
    marginTop: 8,
  },
});
