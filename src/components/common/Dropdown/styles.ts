import { StyleSheet } from 'react-native';
import { typography } from '../../../theme/typography';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 14,
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#171717',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...typography.body.b2.regular,
    color: colors.neutrals[75],
    marginBottom: 8,
  },
  text: {
    ...typography.body.b1.semiBold,
    color: colors.neutrals.white,
    flexShrink: 1,
  },
  placeholder: {
    color: colors.neutrals[50],
  },
  arrowImage: {
    width: 20,
    height: 20,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to see where we are
  },
  modalContent: {
    position: 'absolute',
    maxHeight: 250,
    backgroundColor: colors.neutrals[20], // Dark background
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutrals[30],
    overflow: 'hidden',
    // Shadow for popping off
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listContent: {
    paddingVertical: 10,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals[20],
  },
  selectedOption: {
    backgroundColor: colors.primary.main + '20',
  },
  optionText: {
    ...typography.body.b1.regular,
    color: colors.neutrals.white,
  },
  selectedOptionText: {
    ...typography.body.b1.medium,
    color: colors.primary.main,
  },
});
