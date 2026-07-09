import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
import { styles } from './styles';

const OUTCOMES = ['Played', 'Missed', 'Left', 'Clean Bowled'];

interface EditOutcomeModalProps {
  isVisible: boolean;
  currentOutcome?: string;
  onDone: (outcome: string) => void;
  onClose: () => void;
}

export const EditOutcomeModal: React.FC<EditOutcomeModalProps> = ({
  isVisible,
  currentOutcome,
  onDone,
  onClose,
}) => {
  const [selected, setSelected] = useState(currentOutcome ?? OUTCOMES[0]);

  return (
    <BottomSheet
      isVisible={isVisible}
      title="Edit Outcome"
      onClose={onClose}
      showHandle
    >
      <View style={styles.optionsList}>
        {OUTCOMES.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionRow,
              selected === option && styles.optionRowSelected,
            ]}
            activeOpacity={0.7}
            onPress={() => setSelected(option)}
          >
            <Text
              style={[
                styles.optionText,
                selected === option && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button label="DONE" variant="primary" onPress={() => onDone(selected)} />
    </BottomSheet>
  );
};
