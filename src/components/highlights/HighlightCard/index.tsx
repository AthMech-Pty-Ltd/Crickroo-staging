import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BoulesIcon, CricketIcon } from 'phosphor-react-native';
import { styles } from './styles';
import { colors } from '../../../theme/colors';
import { HighlightSession } from '../../../types';

interface HighlightCardProps extends HighlightSession {
  onPress: () => void;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({
  title,
  // subtitle,
  mode,
  type,
  balls,
  thumbnail,
  duration,

  onPress,
}) => {
  const ModeIcon =
    mode === 'bowling' ? BoulesIcon : mode === 'batting' ? CricketIcon : null;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={onPress}
    >
      <Image source={thumbnail} style={styles.thumbnail} resizeMode="cover" />

      <View style={styles.topRow}>
        <View style={styles.leftColumn}>
          <View style={styles.badge}>
            {ModeIcon && (
              <ModeIcon
                size={14}
                color={colors.neutrals.black}
                weight="regular"
              />
            )}
            <Text style={styles.badgeText}>{type}</Text>
          </View>
          <View style={styles.ballCountBadge}>
            <BoulesIcon size={14} color={colors.neutrals.white} />
            <Text style={styles.ballCountText}>{balls}</Text>
          </View>
        </View>
      </View>

      <View style={styles.vignetteWrapper}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
          style={styles.vignette}
        />
        <View style={styles.vignetteContent}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {/* {subtitle} •  */}
            {duration}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
