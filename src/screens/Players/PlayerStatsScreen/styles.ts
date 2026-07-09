import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  scrollContent: {
    paddingBottom: 40,
    zIndex: 1,
  },
  statsContent: {
    flex: 1,
    overflow: 'hidden',
    zIndex: 1,
  },
  mainToggle: {
    marginHorizontal: 14,
    marginTop: 20,
  },
  filterBar: {
    marginHorizontal: 14,
    marginTop: 18,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  statsContainer: {
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(69, 69, 69, 0.16)',
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  lengthStatsContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
  },
  outcomeStatsContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  pitchSection: {
    marginHorizontal: 14,
    marginTop: 0,
    marginBottom: 16,
    backgroundColor: 'rgba(12, 13, 13, 1)',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
  },
  sectionTitle: {
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.neutrals.white,
    marginBottom: 12,
  },
  skeletonControl: {
    height: 40,
    borderRadius: 10,
    marginHorizontal: 14,
    marginTop: 20,
  },
  skeletonDropdown: {
    height: 36,
    borderRadius: 8,
    marginHorizontal: 14,
    marginTop: 16,
    marginBottom: 24,
  },
  skeletonSummaryRow: {
    marginBottom: 16,
  },
  skeletonStatBoxFirst: {
    flex: 1,
    height: 94,
    borderRadius: 15,
    marginRight: 8,
  },
  skeletonStatBoxLast: {
    flex: 1,
    height: 94,
    borderRadius: 15,
  },
  skeletonCard: {
    height: 128,
    borderRadius: 15,
    marginHorizontal: 14,
    marginBottom: 16,
  },
  skeletonSectionTitle: {
    height: 28,
    borderRadius: 6,
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 20,
    width: 100,
  },
  skeletonPitchMap: {
    height: 220,
    borderRadius: 15,
    marginHorizontal: 14,
  },
  skeletonVizTitle: {
    height: 24,
    width: 120,
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonVizSquare: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
  },
  vizCard: {
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  vizDots: {
    justifyContent: 'center',
    marginTop: 10,
  },
});
