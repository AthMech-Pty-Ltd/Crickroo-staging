import React, { useEffect } from 'react';
import {
  View,
  Image,
  StatusBar,
  ViewStyle,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import CrickrooLogoIcon from '../../../assets/images/crickroo-logo-icon-transparent.svg';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { styles } from './styles';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { useKeyboard } from '../../../hooks/useKeyboard';

interface BaseAuthLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  footer?: React.ReactNode;
  hasFooterBackground?: boolean;
  headerVariant?: 'tall' | 'standard';
  isExiting?: boolean;
  headerHeightRatio?: number;
}

const EASE_OUT = Easing.out(Easing.cubic);

export const BaseAuthLayout: React.FC<BaseAuthLayoutProps> = ({
  children,
  style,
  onBack,
  title,
  subtitle,
  headerRight,
  currentStep,
  totalSteps,
  footer,
  hasFooterBackground = false,
  headerVariant = 'tall',
  isExiting = false,
  headerHeightRatio = 0.28,
}) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const upperHeight = screenHeight * headerHeightRatio;
  const isTall = headerVariant === 'tall';

  // ─── shared values ─────────────────────────────────────────────────────────
  const headerY = useSharedValue(isTall ? -upperHeight : 0);
  const titleY = useSharedValue(isTall ? 22 : 0);
  const titleOpacity = useSharedValue(isTall ? 0 : 1);
  const subtitleY = useSharedValue(isTall ? 22 : 0);
  const subtitleOpacity = useSharedValue(isTall ? 0 : 1);
  const brandOpacity = useSharedValue(1);

  // Standard variant: header bar slides in (hook handles animation + no-flash guarantee)
  const { headerStyle: stdHeaderAnimStyle } = useHeaderAnimation();

  useEffect(() => {
    if (!isTall) return;

    // 1. Gradient curtain drops from above
    headerY.value = withTiming(0, { duration: 500, easing: EASE_OUT });

    // 2. Title slides up
    titleY.value = withDelay(
      250,
      withTiming(0, { duration: 400, easing: EASE_OUT }),
    );
    titleOpacity.value = withDelay(250, withTiming(1, { duration: 350 }));

    // 3. Subtitle slides up
    subtitleY.value = withDelay(
      330,
      withTiming(0, { duration: 400, easing: EASE_OUT }),
    );
    subtitleOpacity.value = withDelay(330, withTiming(1, { duration: 350 }));

    // 4. Brand word: single dim-flash after title settles
    brandOpacity.value = withDelay(
      720,
      withSequence(
        withTiming(0.5, { duration: 180 }),
        withTiming(1.0, { duration: 460, easing: EASE_OUT }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── animated styles ───────────────────────────────────────────────────────
  const headerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleY.value }],
    opacity: subtitleOpacity.value,
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
  }));

  // ─── step progress bar ─────────────────────────────────────────────────────
  const hasStepBar = currentStep !== undefined && totalSteps !== undefined;
  const initialBarWidth = hasStepBar
    ? (currentStep! / totalSteps!) * screenWidth
    : 0;
  const progressBarWidth = useSharedValue(initialBarWidth);

  useEffect(() => {
    if (!hasStepBar) return;
    progressBarWidth.value = withTiming(
      (currentStep! / totalSteps!) * screenWidth,
      { duration: 320, easing: EASE_OUT },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: progressBarWidth.value,
  }));

  // ─── content & footer entry / exit animations ──────────────────────────────
  const contentY = useSharedValue(28);
  const contentOpacity = useSharedValue(0);
  const footerY = useSharedValue(28);
  const footerOpacity = useSharedValue(0);

  const keyboardHeight = useKeyboard();

  // Entry on mount
  useEffect(() => {
    const delay = isTall ? 200 : 0;
    contentY.value = withDelay(
      delay,
      withTiming(0, { duration: 380, easing: EASE_OUT }),
    );
    contentOpacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    footerY.value = withDelay(
      delay + 80,
      withTiming(0, { duration: 380, easing: EASE_OUT }),
    );
    footerOpacity.value = withDelay(
      delay + 80,
      withTiming(1, { duration: 300 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exit when RegistrationFlow signals transition
  useEffect(() => {
    if (!isExiting) return;
    cancelAnimation(contentY);
    cancelAnimation(contentOpacity);
    cancelAnimation(footerY);
    cancelAnimation(footerOpacity);
    contentOpacity.value = withTiming(0, { duration: 180 });
    contentY.value = withTiming(-20, { duration: 180 });
    footerOpacity.value = withTiming(0, { duration: 140 });
    footerY.value = withTiming(-20, { duration: 140 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting]);

  const contentAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  const footerAnimStyle = useAnimatedStyle(() => {
    const bottomInsetPadding = Math.max(insets.bottom, 20);
    // Smoothly reduce padding to 20 when keyboard opens
    const dynamicPaddingBottom =
      keyboardHeight.value > 0 ? 20 : bottomInsetPadding;

    return {
      transform: [{ translateY: footerY.value }],
      opacity: footerOpacity.value,
      paddingBottom: dynamicPaddingBottom,
    };
  });

  const keyboardAnimStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  // ─── title renderer (splits CrickRoo for brand pulse) ─────────────────────
  const renderTitle = () => {
    if (!title) return null;
    if (title.includes('CrickRoo')) {
      const parts = title.split('CrickRoo');
      return (
        <Text style={styles.title}>
          {parts[0]}
          <Animated.Text style={[styles.title, brandStyle]}>
            CrickRoo
          </Animated.Text>
          {parts[1]}
        </Text>
      );
    }
    return <Text style={styles.title}>{title}</Text>;
  };

  return (
    <Animated.View style={[styles.container, keyboardAnimStyle]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {isTall && (
        <Animated.View
          style={[styles.upperHalf, { height: upperHeight }, headerAnimStyle]}
        >
          <Image
            source={require('../../../assets/images/auth_gradient.png')}
            style={styles.gradientImage}
            resizeMode="cover"
          />
          <View style={styles.logoIcon}>
            <CrickrooLogoIcon width={72} height={72} />
          </View>
        </Animated.View>
      )}

      <SafeAreaView
        style={[styles.safeArea, style]}
        edges={['top', 'left', 'right']}
      >
        <Animated.View
          style={[
            styles.headerContainer,
            { height: upperHeight - 10 },
            !isTall && styles.headerContainerStandard,
            !isTall && stdHeaderAnimStyle,
          ]}
        >
          {isTall ? (
            <>
              <View style={styles.topRow}>
                {onBack && (
                  <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeftIcon size={24} color={colors.neutrals.white} />
                  </TouchableOpacity>
                )}
                <View style={styles.flex1} />
                {headerRight}
              </View>

              {(title || subtitle) && (
                <View style={styles.titleArea}>
                  {title && (
                    <Animated.View style={titleAnimStyle}>
                      {renderTitle()}
                    </Animated.View>
                  )}
                  {subtitle && (
                    <Animated.Text style={[styles.subtitle, subtitleAnimStyle]}>
                      {subtitle}
                    </Animated.Text>
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                  <ArrowLeftIcon size={24} color={colors.neutrals.white} />
                </TouchableOpacity>
              )}
              {title && <Text style={styles.headerTitle}>{title}</Text>}
              <View style={styles.flex1} />
              {headerRight}
            </>
          )}
        </Animated.View>

        {hasStepBar && (
          <View style={styles.fixedStepIndicator}>
            <Text style={styles.stepText}>
              Step {currentStep} of {totalSteps}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressBarStyle]} />
            </View>
          </View>
        )}

        <Animated.View
          style={[
            styles.contentWrapper,
            !isTall && styles.contentWrapperStandard,
            contentAnimStyle,
          ]}
        >
          {children}
        </Animated.View>
      </SafeAreaView>

      {footer && (
        <Animated.View
          style={[
            styles.footerContainer,
            hasFooterBackground && styles.footerWithBackground,
            footerAnimStyle,
          ]}
        >
          {footer}
        </Animated.View>
      )}
    </Animated.View>
  );
};
