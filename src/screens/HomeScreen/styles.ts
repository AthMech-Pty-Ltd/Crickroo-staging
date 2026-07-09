import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
  },
  homeBackgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  homeBackgroundDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  homeBackgroundBottomFade: {
    ...StyleSheet.absoluteFillObject,
  },
  connectivityBanner: {
    backgroundColor: colors.error[30],
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectivityBannerOnline: {
    backgroundColor: colors.success[20],
  },
  connectivityBannerText: {
    ...typography.captions.c1.semiBold,
    color: colors.neutrals.white,
  },
  headerContainer: {
    height: 64,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerTitle: {
    ...typography.headers.h2.semiBold,
    color: colors.neutrals.white,
  },
  highlightsHeaderTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals[80],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glass.primary_05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 24,
    height: 24,
    tintColor: colors.neutrals.white,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    marginRight: 8,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greeting: {
    ...typography.body.b1.semiBold,
    fontWeight: '700',
    color: colors.neutrals.white,
  },
  date: {
    ...typography.body.b2.medium,
    color: colors.neutrals[80],
    fontSize: 14,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  placeholderContainer: {
    flex: 1,
  },
  statsTabContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  statsContent: {
    flex: 1,
    overflow: 'hidden',
  },
  comingSoonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutrals[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  comingSoonLabel: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    marginBottom: 8,
  },
  mainToggle: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  filterBar: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 18,
    gap: 18,
  },
  filterDropdown: {
    flex: 1,
  },
  filterDropdownSkeleton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsContainer: {
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(69, 69, 69, 0.16)',
    borderRadius: 14,
    marginHorizontal: 20,
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
  comingSoonText: {
    ...typography.body.b2.medium,
    color: colors.neutrals[40],
    textAlign: 'center',
    paddingVertical: 20,
    flex: 1,
  },
  pitchSection: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 16,
    backgroundColor: 'rgba(12, 13, 13, 1)',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.11)',
  },
  pitchImageWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 1, // square, e.g. 400x400 source displayed squared
  },
  pitchImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutrals.card_border_15,
    backgroundColor: colors.neutrals.bg,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    ...typography.captions.c2.medium,
    color: colors.neutrals[40],
  },
  activeNavText: {
    color: colors.primary.main,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.neutrals.white,
    fontWeight: 'bold',
  },
  // ─── skeleton ──────────────────────────────────────────────────────────────
  skeletonControl: {
    height: 40,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
  skeletonDropdown: {
    height: 36,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  skeletonSummaryRow: {
    // match the real summaryRow spacing so nothing shifts when data arrives
    marginBottom: 16,
  },
  skeletonStatBoxFirst: {
    // height matches the real summary StatBox (padding 16*2 + border 2 +
    // label line 20 + label margin 8 + value line 32 = 94)
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
    // matches the real statsContainer minHeight (see statsContainer)
    height: 128,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  skeletonSectionTitle: {
    height: 28,
    borderRadius: 6,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    width: 100,
  },
  skeletonPitchMap: {
    height: 220,
    borderRadius: 15,
    marginHorizontal: 20,
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
  tabHidden: {
    display: 'none',
  },
  downloadButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutrals.deep_black,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  downloadButton: {
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.black,
    letterSpacing: 1,
  },
});
