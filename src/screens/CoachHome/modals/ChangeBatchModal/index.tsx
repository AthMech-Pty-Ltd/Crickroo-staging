import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { Dropdown } from '../../../../components/common/Dropdown';
import { Button } from '../../../../components/common/Button';
import { PlayerPreview } from '../PlayerPreview';
import { styles } from '../styles';

interface ChangeBatchModalProps {
  isVisible: boolean;
  playerName: string;
  playerMeta: string;
  currentBatch: string;
  batchOptions: string[];
  avatarUrl?: string | null;
  title?: string;
  onClose: () => void;
  onSave: (batch: string) => void;
}

export const ChangeBatchModal: React.FC<ChangeBatchModalProps> = ({
  isVisible,
  playerName,
  playerMeta,
  currentBatch,
  batchOptions,
  avatarUrl,
  title = 'Assign Batch',
  onClose,
  onSave,
}) => {
  const [batch, setBatch] = useState(currentBatch);

  useEffect(() => {
    if (isVisible) setBatch(currentBatch);
  }, [isVisible, currentBatch]);

  return (
    <BottomSheet isVisible={isVisible} title={title} onClose={onClose}>
      <PlayerPreview
        name={playerName}
        meta={playerMeta}
        avatarUrl={avatarUrl}
      />

      <View style={styles.formField}>
        <Dropdown
          label="Assign to Batch"
          options={batchOptions}
          selectedValue={batch}
          onSelect={setBatch}
          triggerStyle={styles.dropdownTrigger}
        />
      </View>

      <Button
        label="Save"
        variant="primary"
        disabled={!batch || batch === currentBatch}
        onPress={() => onSave(batch)}
        style={styles.primaryButton}
      />
    </BottomSheet>
  );
};
