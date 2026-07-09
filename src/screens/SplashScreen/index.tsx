import React, { useEffect } from 'react';
import { View, StatusBar, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { styles } from './styles';
import { ASSETS } from '../../constants/assets';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { height } = useWindowDimensions();

  // 1. Background curtain drop
  const bgTranslateY = useSharedValue(-height);

  // 2. Logo dramatic pop-in (scale + spring)
  const logoScale = useSharedValue(0.1);
  const logoOpacity = useSharedValue(0);

  // 3. Tagline slides up + fades in
  const taglineTranslateY = useSharedValue(12);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // 0ms — background curtain drops into view
    bgTranslateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // 600ms — dramatic logo pop-in
    logoOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
    logoScale.value = withDelay(
      600,
      withSequence(
        withTiming(1.4, { duration: 300, easing: Easing.out(Easing.exp) }),
        withSpring(1, { damping: 10, stiffness: 100 }),
      ),
    );

    // 1200ms — tagline slides up & fades in
    taglineTranslateY.value = withDelay(
      1200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );
    taglineOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));

    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bgTranslateY.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.View style={[styles.backgroundLayer, bgAnimatedStyle]} />

      <View style={styles.centerContent}>
        <View style={styles.logoContainer}>
          <Animated.View style={logoAnimatedStyle}>
            <Image
              source={ASSETS.IMAGES.LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </View>

      <SafeAreaView style={styles.footer}>
        <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
          Beta Application
        </Animated.Text>
      </SafeAreaView>
    </View>
  );
};
