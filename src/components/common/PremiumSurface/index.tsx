import React, { ReactNode } from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LockKeyIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface PremiumSurfaceProps {
  title: string;
  description: string;
  locked: boolean;
  children?: ReactNode;
  previewImage?: ImageSourcePropType;
  ctaLabel?: string;
  badgeLabel?: string;
  style?: StyleProp<ViewStyle>;
  onUpgrade?: () => void;
}

export const PremiumSurface: React.FC<PremiumSurfaceProps> = ({
  title,
  description,
  locked,
  children,
  previewImage,
  ctaLabel = 'UPGRADE TO PLAYER PRO',
  badgeLabel = 'PRO',
  style,
  onUpgrade,
}) => {
  if (!locked) {
    return <View style={style}>{children}</View>;
  }

  const content = (
    <View style={styles.previewContent}>
      <View style={styles.lockCircle}>
        <LockKeyIcon size={34} color={colors.primary.main} weight="regular" />
      </View>
      <Text style={styles.lockTitle}>{title}</Text>
      <Text style={styles.lockDescription}>{description}</Text>
      <TouchableOpacity
        activeOpacity={0.86}
        style={styles.ctaButton}
        onPress={onUpgrade}
      >
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      </View>

      {previewImage ? (
        <ImageBackground
          source={previewImage}
          resizeMode="cover"
          style={styles.preview}
          imageStyle={styles.previewImage}
        >
          <LinearGradient
            colors={[colors.glass.black_30, colors.glass.black_60]}
            style={styles.overlay}
          >
            {content}
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[colors.primary[10], colors.glass.black_60]}
          style={styles.preview}
        >
          {content}
        </LinearGradient>
      )}
    </View>
  );
};
