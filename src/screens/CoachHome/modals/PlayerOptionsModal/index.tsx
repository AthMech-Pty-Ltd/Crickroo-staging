import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { PlayerPreview } from '../PlayerPreview';
import { colors } from '../../../../theme/colors';
import { styles } from '../styles';

interface PlayerOptionsModalProps {
  isVisible: boolean;
  playerName: string;
  playerMeta: string;
  avatarUrl?: string | null;
  batchLabel?: string;
  deleteLabel?: string;
  onClose: () => void;
  onChangeBatch: () => void;
  onDelete: () => void;
}

export const PlayerOptionsModal: React.FC<PlayerOptionsModalProps> = ({
  isVisible,
  playerName,
  playerMeta,
  avatarUrl,
  batchLabel = 'Assign Batch',
  deleteLabel = 'Delete Player',
  onClose,
  onChangeBatch,
  onDelete,
}) => {
  return (
    <BottomSheet isVisible={isVisible} title="Player Options" onClose={onClose}>
      <PlayerPreview
        name={playerName}
        meta={playerMeta}
        avatarUrl={avatarUrl}
      />

      <TouchableOpacity
        style={styles.optionRow}
        activeOpacity={0.7}
        onPress={onChangeBatch}
      >
        <Text style={styles.optionLabel}>{batchLabel}</Text>
        <CaretRightIcon size={18} color={colors.neutrals[70]} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionRow}
        activeOpacity={0.7}
        onPress={onDelete}
      >
        <Text style={styles.optionLabel}>{deleteLabel ?? 'Delete Player'}</Text>
        <CaretRightIcon size={18} color={colors.neutrals[70]} />
      </TouchableOpacity>
    </BottomSheet>
  );
};
