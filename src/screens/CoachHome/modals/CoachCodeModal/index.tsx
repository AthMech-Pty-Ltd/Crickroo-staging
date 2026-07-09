import React from 'react';
import { View, Text } from 'react-native';
import { CopyIcon, ShareFatIcon } from 'phosphor-react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { Button } from '../../../../components/common/Button';
import { colors } from '../../../../theme/colors';
import { styles } from './styles';

interface CoachCodeModalProps {
  isVisible: boolean;
  coachCode: string;
  onClose: () => void;
  onCopy: () => void;
  onShare: () => void;
}

export const CoachCodeModal: React.FC<CoachCodeModalProps> = ({
  isVisible,
  coachCode,
  onClose,
  onCopy,
  onShare,
}) => {
  return (
    <BottomSheet
      isVisible={isVisible}
      title="Your Coach Code"
      onClose={onClose}
    >
      <Text style={styles.description}>
        Share this code with your players, so they can link their accounts to
        you
      </Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{coachCode}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Button
          label="Copy"
          variant="primary_dark"
          onPress={onCopy}
          style={styles.actionButton}
          leftIcon={<CopyIcon size={20} color={colors.primary.main} />}
        />
        <Button
          label="Share"
          variant="primary"
          onPress={onShare}
          style={styles.actionButton}
          leftIcon={<ShareFatIcon size={20} color={colors.neutrals.black} />}
        />
      </View>
    </BottomSheet>
  );
};
