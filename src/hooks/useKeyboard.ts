import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import {
  useSharedValue,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

export const useKeyboard = (): SharedValue<number> => {
  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    // On iOS, we can rely on Will- events for smooth animation synchronized with the keyboard.
    // On Android, DidShow/DidHide are typically used.
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, {
        duration: e.duration || 250,
        easing: Easing.out(Easing.ease),
      });
    });

    const hideSub = Keyboard.addListener(hideEvent, e => {
      keyboardHeight.value = withTiming(0, {
        duration: e.duration || 250,
        easing: Easing.out(Easing.ease),
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  return keyboardHeight;
};
