import React from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  StyleProp,
  Text,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import BallIcon from '../../../assets/images/ball.svg';
import LockImage from '../../../assets/images/lock.svg';
import { ASSETS } from '../../../constants/assets';
import { VizPoint } from '../../../services/dashboard.service';
import { Viewport, placeDot } from '../viewports';
import { styles } from './styles';

const BALL_SIZE = 12;

export interface VizDot {
  norm: VizPoint;
}

interface VizImageProps {
  image: ImageSourcePropType;
  dots?: VizDot[];
  viewport: Viewport;
  style?: StyleProp<ViewStyle>;
  locked?: boolean;
  lockedTitle?: string;
  lockedDescription?: string;
  children?: React.ReactNode;
}

export const VizImage: React.FC<VizImageProps> = ({
  image,
  dots = [],
  viewport,
  style,
  locked = false,
  lockedTitle = 'Your pitch map is ready',
  lockedDescription = 'See exactly where bowlers are\ntargeting you',
  children,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Image
        source={image}
        style={styles.image}
        resizeMode="cover"
        blurRadius={locked ? 2 : 0}
      />
      {dots.map((dot, i) => {
        const pos = placeDot(dot.norm, viewport);
        return (
          <BallIcon
            key={i}
            width={BALL_SIZE}
            height={BALL_SIZE}
            style={[styles.ball, pos]}
          />
        );
      })}
      {children}
      {locked ? (
        <>
          <BlurView
            pointerEvents="none"
            style={styles.lockedBlur}
            blurType="dark"
            blurAmount={3}
            reducedTransparencyFallbackColor="rgba(13, 13, 12, 0.2)"
          />
          <View pointerEvents="none" style={styles.lockedDim} />
          <View pointerEvents="none" style={styles.lockedContent}>
            <Image
              source={ASSETS.IMAGES.LOGO}
              style={styles.lockedLogo}
              resizeMode="contain"
            />
            <LockImage width={58} height={58} />
            <Text style={styles.lockedTitle}>{lockedTitle}</Text>
            <Text style={styles.lockedDescription}>{lockedDescription}</Text>
            <LinearGradient
              colors={['#EB5F10', '#F4AC25']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.unlockButton}
            >
              <Text style={styles.unlockText}>UNLOCK WITH PRO</Text>
            </LinearGradient>
          </View>
        </>
      ) : null}
    </View>
  );
};
