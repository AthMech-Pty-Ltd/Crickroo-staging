import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { colors } from '../../../../theme/colors';
import { styles } from '../styles';

interface BatchOptionsModalProps {
  isVisible: boolean;
  batchName: string;
  playerCount: number;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const BatchOptionsModal: React.FC<BatchOptionsModalProps> = ({
  isVisible,
  batchName,
  playerCount,
  onClose,
  onRename,
  onDelete,
}) => {
  return (
    <BottomSheet isVisible={isVisible} title="Batch Options" onClose={onClose}>
      <View style={styles.batchPreviewCard}>
        <Text style={styles.batchPreviewTitle}>{batchName}</Text>
        <Text style={styles.batchPreviewMeta}>{playerCount} Players</Text>
      </View>

      <TouchableOpacity
        style={styles.optionRow}
        activeOpacity={0.7}
        onPress={onRename}
      >
        <Text style={styles.optionLabel}>Rename Batch</Text>
        <CaretRightIcon size={18} color={colors.neutrals[70]} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionRow}
        activeOpacity={0.7}
        onPress={onDelete}
      >
        <Text style={styles.optionLabel}>Delete Batch</Text>
        <CaretRightIcon size={18} color={colors.neutrals[70]} />
      </TouchableOpacity>
    </BottomSheet>
  );
};
