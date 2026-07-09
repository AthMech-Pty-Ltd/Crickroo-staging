import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HeartIcon, SquareIcon, CheckSquareIcon } from 'phosphor-react-native';
import { styles } from './styles';
import { colors } from '../../../theme/colors';

interface DeliveryClipCardProps {
  id: number;
  label?: string;
  result: string;
  detail: string;
  thumbnail: ImageSourcePropType;
  isSelected?: boolean;
  isFavorite?: boolean;
  isDownloading?: boolean;
  showBadge?: boolean;
  showHeart?: boolean;
  selectionMode?: boolean;
  isChecked?: boolean;
  onPressFavorite?: () => void;
  onLongPress?: () => void;
  onPress: () => void;
}

export const DeliveryClipCard: React.FC<DeliveryClipCardProps> = ({
  id,
  label,
  result,
  detail,
  thumbnail,
  isSelected,
  isFavorite = false,
  isDownloading = false,
  showBadge = true,
  showHeart = true,
  selectionMode = false,
  isChecked = false,
  onPressFavorite,
  onLongPress,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <Image source={thumbnail} style={styles.thumbnail} />

      <View style={styles.vignetteWrapper}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
          style={styles.vignette}
        />
        <View style={styles.vignetteContent}>
          <Text style={styles.resultText} numberOfLines={1}>
            {result}
          </Text>
          <Text style={styles.detailText}>{detail}</Text>
        </View>
      </View>

      {isSelected && (
        <View style={styles.selectedBorder} pointerEvents="none" />
      )}
      {isChecked && <View style={styles.checkedBorder} pointerEvents="none" />}

      {/* Main tap + long press target */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        onLongPress={onLongPress}
      />

      {showBadge && (
        <View style={styles.idBadge}>
          <Text style={styles.idText}>#{label ?? id}</Text>
        </View>
      )}

      {/* Top-right icon — selection square or heart */}
      {selectionMode ? (
        <View style={styles.favButton} pointerEvents="none">
          {isChecked ? (
            <CheckSquareIcon
              size={20}
              color={colors.primary.main}
              weight="fill"
            />
          ) : (
            <SquareIcon
              size={20}
              color={colors.neutrals.white}
              weight="regular"
            />
          )}
        </View>
      ) : showHeart ? (
        <Pressable style={styles.favButton} onPress={onPressFavorite}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.neutrals.white} />
          ) : (
            <HeartIcon
              size={20}
              color={isFavorite ? colors.error[50] : colors.neutrals.white}
              weight={isFavorite ? 'fill' : 'regular'}
            />
          )}
        </Pressable>
      ) : null}
    </View>
  );
};
