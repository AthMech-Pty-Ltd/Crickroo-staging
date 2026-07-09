import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export const styles = StyleSheet.create({
  label: {
    ...typography.body.b2.medium,
    color: colors.neutrals[60],
    marginBottom: 8,
  },
  inputWrapper: {
    height: 56,
    backgroundColor: colors.neutrals.black,
    borderRadius: 12.719,
    borderWidth: 0.727,
    borderColor: colors.backgrounds.auth_card_border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  valueText: {
    ...typography.body.b1.regular,
    color: colors.neutrals[60],
    flex: 1,
  },
  placeholder: {
    color: colors.neutrals[40],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.neutrals.card_dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgrounds.auth_card_border,
  },
  sheetTitle: {
    ...typography.body.b1.medium,
    color: colors.neutrals.white,
  },
  confirmButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary[15],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  confirmText: {
    ...typography.body.b2.medium,
    color: colors.primary.main,
  },
  pickerRow: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  column: {
    flex: 1,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.neutrals[20],
    borderBottomColor: colors.neutrals[20],
    zIndex: 1,
  },
  columnContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    ...typography.body.b1.regular,
    color: colors.neutrals[40],
    fontSize: 15,
  },
  itemTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});
