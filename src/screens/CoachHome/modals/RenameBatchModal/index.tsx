import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { Input } from '../../../../components/common/Input';
import { Button } from '../../../../components/common/Button';
import { styles } from '../styles';

interface RenameBatchModalProps {
  isVisible: boolean;
  initialName: string;
  loading?: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const RenameBatchModal: React.FC<RenameBatchModalProps> = ({
  isVisible,
  initialName,
  loading = false,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isVisible) setName(initialName);
  }, [isVisible, initialName]);

  const trimmed = name.trim();

  return (
    <BottomSheet isVisible={isVisible} title="Rename Batch" onClose={onClose}>
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
        label="Save"
        variant="primary"
        disabled={!trimmed || trimmed === initialName.trim() || loading}
        loading={loading}
        onPress={() => onSave(trimmed)}
        style={styles.primaryButton}
      />
    </BottomSheet>
  );
};
