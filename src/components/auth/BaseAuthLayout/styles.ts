import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const UPPER_HEIGHT = SCREEN_HEIGHT * 0.28;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.black,
  },
  upperHalf: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: UPPER_HEIGHT,
    overflow: 'hidden',
  },
  gradientImage: {
    width: '100%',
    height: '100%',
  },
  logoIcon: {
    position: 'absolute',
    right: 2,
    bottom: -10,
    opacity: 0.4,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    height: UPPER_HEIGHT - 10,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  headerContainerStandard: {
    height: 64,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
  },
  headerTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 50,
    backgroundColor: colors.glass.black_40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  backIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.neutrals.white,
  },
  titleArea: {
    marginTop: 0,
  },
  flex1: {
    flex: 1,
  },
  title: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  subtitle: {
    ...typography.body.b1.regular,
    color: colors.neutrals[80],
    marginTop: 8,
  },
  fixedStepIndicator: {
    position: 'absolute',
    top: UPPER_HEIGHT - 26,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  stepText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals[75],
    marginBottom: 8,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'transparent',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },
  contentWrapper: {
    flex: 1,
  },
  contentWrapperStandard: {
    paddingTop: 0,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    width: '100%',
  },
  footerWithBackground: {
    backgroundColor: colors.neutrals.card_dark,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
  },
});
