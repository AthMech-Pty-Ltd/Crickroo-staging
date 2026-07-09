import React from 'react';
import { View, Text, Image } from 'react-native';
import { UserCircleIcon } from 'phosphor-react-native';
import { colors } from '../../../../theme/colors';
import { styles } from '../styles';

interface PlayerPreviewProps {
  name: string;
  meta: string;
  avatarUrl?: string | null;
}

export const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  name,
  meta,
  avatarUrl,
}) => (
  <View style={styles.playerPreviewCard}>
    {avatarUrl ? (
      <Image
        source={{ uri: avatarUrl }}
        style={styles.playerPreviewAvatarImage}
      />
    ) : (
      <UserCircleIcon
        size={44}
        color={colors.neutrals[40]}
        style={styles.playerPreviewAvatarPlaceholder}
      />
    )}
    <View style={styles.playerPreviewInfo}>
      <Text style={styles.playerPreviewName}>{name}</Text>
      <Text style={styles.playerPreviewMeta}>{meta}</Text>
    </View>
  </View>
);
