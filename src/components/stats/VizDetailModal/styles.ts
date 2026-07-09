import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.black,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
  },
  backgroundBottomFade: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
    zIndex: 1,
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
  headerTitle: {
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.neutrals.white,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    zIndex: 1,
  },
  filter: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterDropdown: {
    flex: 1,
  },
  graphSection: {
    marginBottom: 20,
  },
  graphPage: {
    paddingHorizontal: 20,
  },
  chartPanel: {
    backgroundColor: 'rgba(12, 13, 13, 1)',
  },
  dots: {
    justifyContent: 'center',
    marginTop: 12,
  },
  kpiRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(12, 13, 13, 1)',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  skeletonGraph: {
    aspectRatio: 1,
    borderRadius: 15,
    marginHorizontal: 20,
  },
  skeletonKpi: {
    height: 128,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 16,
  },
});
