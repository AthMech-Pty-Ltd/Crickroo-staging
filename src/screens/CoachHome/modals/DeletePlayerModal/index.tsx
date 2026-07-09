import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { PlayerPreview } from '../PlayerPreview';
import { styles } from '../styles';

interface DeletePlayerModalProps {
  isVisible: boolean;
  playerName: string;
  playerMeta: string;
  batchName: string;
  avatarUrl?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeletePlayerModal: React.FC<DeletePlayerModalProps> = ({
  isVisible,
  playerName,
  playerMeta,
  batchName,
  avatarUrl,
  onClose,
  onConfirm,
}) => {
  const firstName = playerName.split(' ')[0] || playerName;
  return (
    <BottomSheet isVisible={isVisible} title="Delete Player" onClose={onClose}>
      <PlayerPreview
        name={playerName}
        meta={playerMeta}
        avatarUrl={avatarUrl}
      />

      <Text style={styles.confirmText}>
        Are you sure you want to remove {firstName}
        {batchName ? ` from ${batchName} batch` : ''}?
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
