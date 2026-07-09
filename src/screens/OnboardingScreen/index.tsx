import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Button } from '../../components/common/Button';
import { IconButton } from '../../components/common/IconButton';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { colors } from '../../theme/colors';
import { styles } from './styles';
import { ASSETS } from '../../constants/assets';

interface OnboardingScreenProps {
  onFinish: () => void;
  onSignIn?: () => void;
}

const steps = [
  {
    title: 'Welcome to CrickRoo',
    description: 'Record, Analyse, Improve!',
    image: ASSETS.IMAGES.ONBOARDING_1,
    buttonLabel: 'GET STARTED',
  },
  {
    title: 'Recap your sessions',
    description: 'With automated ball-by-ball highlights',
    image: ASSETS.IMAGES.ONBOARDING_2,
    buttonLabel: 'NEXT',
  },
  {
    title: 'Track and improve your game',
    description: 'With stats that matter the most',
    image: ASSETS.IMAGES.ONBOARDING_3,
    buttonLabel: 'CREATE YOUR ACCOUNT',
  },
];

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinish,
  onSignIn = () => {},
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const dirRef = useRef(1); // 1 = forward, -1 = backward
  const isAnimating = useRef(false);

  // Content block
  const contentX = useSharedValue(screenWidth);
  const contentY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);

  // Footer block
  const footerX = useSharedValue(screenWidth);
  const footerY = useSharedValue(30);
  const footerOpacity = useSharedValue(0);

  // Progress segment widths
  const seg0Width = useSharedValue(16);
  const seg1Width = useSharedValue(16);
  const seg2Width = useSharedValue(16);

  // ─── background entering/exiting animations ────────────────────────────────
  // Defined in render so they capture the current dir/screenWidth at the moment
  // the new Animated.View mounts (key changes). Reanimated applies initialValues
  // before the first frame — guaranteeing the image is never at position 0 first.
  const dir = dirRef.current;
  const sw = screenWidth;

  const bgEntering = useCallback(
    (values: any) => {
      'worklet';
      return {
        initialValues: {
          originX: values.targetOriginX + dir * sw * 0.6,
          originY: values.targetOriginY,
          opacity: 0,
        },
        animations: {
          originX: withTiming(values.targetOriginX, {
            duration: 380,
            easing: EASE_OUT,
          }),
          originY: withTiming(values.targetOriginY, { duration: 380 }),
          opacity: withTiming(1, { duration: 300 }),
        },
      };
    },
    [dir, sw],
  );

  const bgExiting = useCallback(
    (values: any) => {
      'worklet';
      return {
        initialValues: {
          originX: values.currentOriginX,
          originY: values.currentOriginY,
          opacity: 1,
        },
        animations: {
          originX: withTiming(values.currentOriginX - dir * sw * 0.12, {
            duration: 160,
            easing: EASE_IN,
          }),
          originY: withTiming(values.currentOriginY, { duration: 160 }),
          opacity: withTiming(0, { duration: 160 }),
        },
      };
    },
    [dir, sw],
  );

  // ─── exit content, then change step ───────────────────────────────────────
  const triggerExit = useCallback(
    (direction: number, nextStep: number) => {
      const EXIT = 160;

      cancelAnimation(contentX);
      cancelAnimation(contentY);
      cancelAnimation(contentOpacity);
      cancelAnimation(footerX);
      cancelAnimation(footerY);
      cancelAnimation(footerOpacity);

      contentX.value = withTiming(-direction * sw * 0.26, {
        duration: EXIT,
        easing: EASE_IN,
      });
      contentY.value = withTiming(-18, { duration: EXIT });
      contentOpacity.value = withTiming(0, { duration: EXIT });

      footerX.value = withTiming(-direction * sw * 0.26, { duration: EXIT });
      footerY.value = withTiming(-18, { duration: EXIT });
      footerOpacity.value = withTiming(0, { duration: EXIT });

      setTimeout(() => setCurrentStep(nextStep), EXIT + 16);
    },
    [sw, contentX, contentY, contentOpacity, footerX, footerY, footerOpacity],
  );

  // ─── enter content on step change ─────────────────────────────────────────
  useEffect(() => {
    isAnimating.current = false;
    const d = dirRef.current;

    contentX.value = d * sw * 0.7;
    contentY.value = 24;
    contentOpacity.value = 0;
    contentX.value = withTiming(0, { duration: 360, easing: EASE_OUT });
    contentY.value = withTiming(0, { duration: 360, easing: EASE_OUT });
    contentOpacity.value = withTiming(1, { duration: 280 });

    footerX.value = d * sw * 0.7;
    footerY.value = 24;
    footerOpacity.value = 0;
    footerX.value = withDelay(
      80,
      withTiming(0, { duration: 360, easing: EASE_OUT }),
    );
    footerY.value = withDelay(
      80,
      withTiming(0, { duration: 360, easing: EASE_OUT }),
    );
    footerOpacity.value = withDelay(80, withTiming(1, { duration: 280 }));
  }, [
    currentStep,
    sw,
    contentX,
    contentY,
    contentOpacity,
    footerX,
    footerY,
    footerOpacity,
  ]);

  // ─── progress segment widths ──────────────────────────────────────────────
  const progressIndex = currentStep;
  useEffect(() => {
    seg0Width.value = withTiming(progressIndex === 0 ? 32 : 16, {
      duration: 300,
      easing: EASE_OUT,
    });
    seg1Width.value = withTiming(progressIndex === 1 ? 32 : 16, {
      duration: 300,
      easing: EASE_OUT,
    });
    seg2Width.value = withTiming(progressIndex === 2 ? 32 : 16, {
      duration: 300,
      easing: EASE_OUT,
    });
  }, [progressIndex, seg0Width, seg1Width, seg2Width]);

  // ─── navigation ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      onFinish();
      return;
    }
    if (isAnimating.current) return;
    isAnimating.current = true;
    dirRef.current = 1;
    triggerExit(1, currentStep + 1);
  };

  const handleBack = useCallback(() => {
    if (currentStep <= 0 || isAnimating.current) return;
    isAnimating.current = true;
    dirRef.current = -1;
    triggerExit(-1, currentStep - 1);
  }, [currentStep, triggerExit]);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentStep > 0) {
        handleBack();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [currentStep, handleBack]);

  // ─── animated styles ──────────────────────────────────────────────────────
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: contentX.value }, { translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  const footerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: footerX.value }, { translateY: footerY.value }],
    opacity: footerOpacity.value,
  }));

  const seg0Style = useAnimatedStyle(() => ({ width: seg0Width.value }));
  const seg1Style = useAnimatedStyle(() => ({ width: seg1Width.value }));
  const seg2Style = useAnimatedStyle(() => ({ width: seg2Width.value }));
  const segStyles = [seg0Style, seg1Style, seg2Style];

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;

  return (
    <View style={styles.background}>
      {/* Background: key remounts on each step so entering/exiting fire fresh.
          Reanimated sets initialValues before frame 1 — no flash at position 0. */}
      <Animated.View
        key={currentStep}
        entering={bgEntering}
        exiting={bgExiting}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={step.image}
          style={{ width: screenWidth, height: screenHeight }}
          resizeMode="cover"
        />
      </Animated.View>
      <View pointerEvents="none" style={styles.vignetteContainer}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.18)', 'rgba(0, 0, 0, 0.78)']}
          locations={[0, 0.45, 1]}
          style={styles.verticalVignette}
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.38)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.38)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.horizontalVignette}
        />
      </View>

      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          {isFirstStep ? (
            <View style={styles.backPlaceholder} />
          ) : (
            <IconButton
              icon={<ArrowLeftIcon size={24} color={colors.neutrals.white} />}
              onPress={handleBack}
              style={styles.backButton}
            />
          )}

          <View style={styles.progressContainer}>
            {[0, 1, 2].map(idx => (
              <Animated.View
                key={idx}
                style={[
                  styles.progressSegment,
                  idx === progressIndex && styles.activeSegment,
                  segStyles[idx],
                ]}
              />
            ))}
          </View>

          {currentStep > 0 && currentStep < steps.length - 1 ? (
            <TouchableOpacity onPress={onFinish} style={styles.skipContainer}>
              <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.title}>
            {step.title.split('CrickRoo')[0]}
            {step.title.includes('CrickRoo') && (
              <Text style={styles.brandText}>CrickRoo</Text>
            )}
            {step.title.split('CrickRoo')[1]}
          </Text>
          <Text style={styles.description}>{step.description}</Text>
        </Animated.View>

        <Animated.View style={[styles.footer, footerStyle]}>
          {isFirstStep ? (
            <>
              <Button
                label={step.buttonLabel}
                onPress={handleNext}
                variant="light"
              />
              <TouchableOpacity
                onPress={onSignIn}
                style={styles.signInContainer}
              >
                <Text style={styles.signInLabel}>
                  Have an account?{' '}
                  <Text style={styles.signInAction}>SIGN IN</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Button
              label={step.buttonLabel}
              onPress={handleNext}
              variant="primary"
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};
