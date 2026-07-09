import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals.bg,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals.card_border_15,
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
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  sectionHeaderText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals[60],
  },
  notificationCard: {
    backgroundColor: colors.neutrals.card_bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutrals.card_border_15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleText: {
    ...typography.body.b2.semiBold,
    color: colors.neutrals.white,
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyTitle: {
    ...typography.headers.h4.semiBold,
    color: colors.neutrals.white,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body.b2.regular,
    color: colors.neutrals[60],
    textAlign: 'center',
  },
});
