import { StyleSheet, Dimensions } from 'react-native';
import { typography } from '../../../theme/typography';
import { colors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.black,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 32,
    color: colors.neutrals.white,
    fontWeight: '300',
  },
  title: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
    marginLeft: 10,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: width * 0.7,
    height: width * 0.9,
    borderWidth: 2,
    borderColor: colors.glass.white_40,
    borderRadius: width * 0.35,
    borderStyle: 'dashed',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.glass.white_30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.neutrals.white,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutrals.white,
  },
});
