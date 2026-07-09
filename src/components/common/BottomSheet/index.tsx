import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  Keyboard,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { XIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface BottomSheetProps {
  isVisible: boolean;
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  sheetContainerStyle?: StyleProp<ViewStyle>;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const EASE_OUT = Easing.out(Easing.cubic);
const BACKDROP_DURATION = 200;
const SHEET_DURATION = 280;

const SERIALIZE_PRESENTATION = Platform.OS === 'ios';
let presentedSheetId: number | null = null;
let sheetIdCounter = 0;
const presentQueue: Array<{ id: number; run: () => void }> = [];

const acquirePresentation = (id: number, run: () => void) => {
  if (
    !SERIALIZE_PRESENTATION ||
    presentedSheetId === null ||
    presentedSheetId === id
  ) {
    presentedSheetId = id;
    run();
    return;
  }
  const existing = presentQueue.findIndex(q => q.id === id);
  if (existing >= 0) presentQueue.splice(existing, 1);
  presentQueue.push({ id, run });
};

const releasePresentation = (id: number) => {
  const queuedIndex = presentQueue.findIndex(q => q.id === id);
  if (queuedIndex >= 0) presentQueue.splice(queuedIndex, 1);
  if (presentedSheetId !== id) return;
  presentedSheetId = null;
  const next = presentQueue.shift();
  if (next) {
    presentedSheetId = next.id;
    next.run();
  }
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  title,
  onClose,
  children,
  showHandle = false,
  closeOnBackdrop = true,
  showCloseButton = true,
  sheetContainerStyle,
}) => {
  const [rendered, setRendered] = useState(isVisible);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);
  const keyboardOffset = useSharedValue(0);
  const sheetIdRef = useRef(++sheetIdCounter);

  useEffect(() => {
    const id = sheetIdRef.current;
    if (isVisible) {
      acquirePresentation(id, () => {
        setRendered(true);
        keyboardOffset.value = 0;
        backdropOpacity.value = withTiming(1, { duration: BACKDROP_DURATION });
        sheetTranslateY.value = withTiming(0, {
          duration: SHEET_DURATION,
          easing: EASE_OUT,
        });
      });
    } else if (rendered) {
      Keyboard.dismiss();
      backdropOpacity.value = withTiming(0, { duration: BACKDROP_DURATION });
      sheetTranslateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: SHEET_DURATION, easing: EASE_OUT },
        finished => {
          if (finished) {
            runOnJS(setRendered)(false);
            runOnJS(releasePresentation)(id);
          }
        },
      );
    } else {
      releasePresentation(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    const id = sheetIdRef.current;
    return () => releasePresentation(id);
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      keyboardOffset.value = withTiming(-e.endCoordinates.height, {
        duration: Platform.OS === 'ios' ? 250 : 150,
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardOffset.value = withTiming(0, {
        duration: Platform.OS === 'ios' ? 250 : 150,
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value + keyboardOffset.value }],
  }));

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.backdropTouchable}
            onPress={closeOnBackdrop ? onClose : undefined}
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, sheetContainerStyle, animatedSheetStyle]}
        >
          {showHandle && <View style={styles.handle} />}

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <XIcon size={18} color={colors.neutrals.white} weight="bold" />
              </TouchableOpacity>
            )}
          </View>

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};
