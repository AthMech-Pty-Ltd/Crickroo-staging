import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

export const SHIMMER_BAND_WIDTH = 220;

interface SkeletonBoxProps {
  /** Shared translateX value driven by the parent skeleton screen */
  shimmerTx: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
}

/**
 * A single skeleton shape.  The shimmer animation is controlled by the parent
 * (one shared value for the whole screen) so all shapes move in perfect sync.
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  shimmerTx,
  style,
}) => {
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTx.value }],
  }));

  return (
    <View style={[styles.base, style]}>
      <Animated.View style={[styles.shimmerBand, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#282624',
    overflow: 'hidden',
  },
  shimmerBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SHIMMER_BAND_WIDTH,
  },
});
