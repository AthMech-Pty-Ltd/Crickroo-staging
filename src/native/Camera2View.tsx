import { requireNativeComponent, type ViewStyle } from 'react-native';

interface Camera2ViewProps {
  style?: ViewStyle;
}

export const Camera2View =
  requireNativeComponent<Camera2ViewProps>('Camera2View');
