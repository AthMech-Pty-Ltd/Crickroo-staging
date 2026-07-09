import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { styles } from '../styles';

interface DeleteBatchModalProps {
  isVisible: boolean;
  batchName: string;
  playerCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteBatchModal: React.FC<DeleteBatchModalProps> = ({
  isVisible,
  batchName,
  playerCount,
  onClose,
  onConfirm,
}) => {
  return (
    <BottomSheet isVisible={isVisible} title="Delete Batch" onClose={onClose}>
      <View style={styles.batchPreviewCard}>
        <Text style={styles.batchPreviewTitle}>{batchName}</Text>
        <Text style={styles.batchPreviewMeta}>{playerCount} Players</Text>
      </View>

      <Text style={styles.confirmText}>
        Are you sure you want to delete this batch?
      </Text>

      <TouchableOpacity
        style={styles.dangerButton}
        activeOpacity={0.8}
        onPress={onConfirm}
      >
        <Text style={styles.dangerButtonText}>DELETE</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
};
