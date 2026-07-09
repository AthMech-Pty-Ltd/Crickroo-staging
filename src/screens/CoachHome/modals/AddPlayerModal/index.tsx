import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { Input } from '../../../../components/common/Input';
import { Dropdown } from '../../../../components/common/Dropdown';
import { Button } from '../../../../components/common/Button';
import { styles } from '../styles';

interface AddPlayerModalProps {
  isVisible: boolean;
  batchOptions: string[];
  initialBatch?: string;
  onClose: () => void;
  onSubmit: (params: { playerId: string; batch: string }) => void;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isVisible,
  batchOptions,
  initialBatch,
  onClose,
  onSubmit,
}) => {
  const [playerId, setPlayerId] = useState('');
  const [batch, setBatch] = useState(initialBatch ?? batchOptions[0] ?? '');

  useEffect(() => {
    if (isVisible) {
      setPlayerId('');
      setBatch(initialBatch ?? batchOptions[0] ?? '');
    }
  }, [isVisible, initialBatch, batchOptions]);

  const trimmed = playerId.trim();

  return (
    <BottomSheet isVisible={isVisible} title="Add New Player" onClose={onClose}>
      <View style={styles.formField}>
        <Input
          label="Player ID"
          value={playerId}
          onChangeText={setPlayerId}
          placeholder="Enter player user ID"
          autoCapitalize="none"
        />
      </View>
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
        label="Add Player"
        variant="primary"
        disabled={!trimmed || !batch}
        onPress={() => onSubmit({ playerId: trimmed, batch })}
        style={styles.primaryButton}
      />
    </BottomSheet>
  );
};
