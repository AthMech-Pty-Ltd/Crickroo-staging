import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { Input } from '../../../../components/common/Input';
import { Button } from '../../../../components/common/Button';
import { styles } from '../styles';

interface AddBatchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isVisible) setName('');
  }, [isVisible]);

  const trimmed = name.trim();

  return (
    <BottomSheet isVisible={isVisible} title="Add New Batch" onClose={onClose}>
      <View style={styles.formField}>
        <Input
          label="Batch Name"
          value={name}
          onChangeText={setName}
          placeholder="Batch name"
          autoCapitalize="words"
        />
      </View>
      <Button
        label="Add Batch"
        variant="primary"
        disabled={!trimmed}
        onPress={() => onSubmit(trimmed)}
        style={styles.primaryButton}
      />
    </BottomSheet>
  );
};
