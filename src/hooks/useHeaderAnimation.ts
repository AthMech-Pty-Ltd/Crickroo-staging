import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

const EASE_OUT = Easing.out(Easing.cubic);

interface UseHeaderAnimationOptions {
  /**
   * Whether to automatically run the animation on mount.
   * Set to false for headers that are not visible on initial render
   * (e.g. a second tab's header) so they start in the hidden state.
   * Default: true.
   */
  autoPlay?: boolean;
}

/**
 * Consistent slide-down + fade-in animation for every header in the app.
 *
 * - `headerStyle`      — apply to the header's `Animated.View`
 * - `triggerAnimation` — call to re-run the animation (e.g. on tab switch).
 *                        Safe to call at any time; uses withSequence so the
 *                        snap-to-hidden and the reveal both run on the UI
 *                        thread — no JS/UI-thread flash.
 * - `reset`            — instantly hide the header (use when leaving the tab
 *                        so the header starts hidden on the next return).
 */
export const useHeaderAnimation = ({
  autoPlay = true,
}: UseHeaderAnimationOptions = {}) => {
  const y = useSharedValue(0);
  const op = useSharedValue(0);

  const triggerAnimation = () => {
    y.value = withSequence(
      withTiming(-28, { duration: 0 }),
      withTiming(0, { duration: 550, easing: EASE_OUT }),
    );
    op.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 480 }),
    );
  };

  /** Instantly hide the header, cancelling any in-progress animation. */
  const reset = () => {
    cancelAnimation(y);
    cancelAnimation(op);
    y.value = 0;
    op.value = 0;
  };

  // Run once on mount (skipped for secondary/inactive headers)
  useEffect(() => {
    if (autoPlay) triggerAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: op.value,
  }));

  return { headerStyle, triggerAnimation, reset };
};
