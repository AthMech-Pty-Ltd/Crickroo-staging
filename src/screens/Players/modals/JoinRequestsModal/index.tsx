import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { XIcon, CheckIcon, UserCircleIcon } from 'phosphor-react-native';
import { BottomSheet } from '../../../../components/common/BottomSheet';
import { colors } from '../../../../theme/colors';
import { styles } from './styles';

export interface JoinRequest {
  id: string;
  player_user_id: string;
  name: string;
  cric_id: string;
  status: string;
  requested_at: string;
  avatarUrl?: string | null;
}

interface JoinRequestsModalProps {
  isVisible: boolean;
  requests: JoinRequest[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const JoinRequestsModal: React.FC<JoinRequestsModalProps> = ({
  isVisible,
  requests,
  onClose,
  onApprove,
  onReject,
}) => {
  return (
    <BottomSheet isVisible={isVisible} title="Join Requests" onClose={onClose}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {requests.map(req => (
          <View key={req.id} style={styles.row}>
            {req.avatarUrl ? (
              <Image
                source={{ uri: req.avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <UserCircleIcon
                size={40}
                color={colors.neutrals[40]}
                style={styles.avatarPlaceholder}
              />
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{req.name}</Text>
              <Text style={styles.meta}>{req.cric_id}</Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              activeOpacity={0.7}
              onPress={() => onReject(req.id)}
            >
              <XIcon size={16} color={colors.error[50]} weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              activeOpacity={0.7}
              onPress={() => onApprove(req.id)}
            >
              <CheckIcon size={16} color={colors.success.main} weight="bold" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};
