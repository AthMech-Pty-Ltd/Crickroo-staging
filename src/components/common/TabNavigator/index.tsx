import React, { useEffect } from 'react';
import { View, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { styles } from './styles';

export interface TabItem {
  id: string | number;
  label: string;
  icon?: string | ((isActive: boolean) => React.ReactNode);
}

interface TabNavigatorProps {
  tabs: TabItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  style?: StyleProp<ViewStyle>;
}

const EASE_OUT = Easing.out(Easing.cubic);

const NavTab: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <View style={styles.iconWrapper}>
      {tab.icon && typeof tab.icon === 'function' && tab.icon(isActive)}
    </View>
  </TouchableOpacity>
);

const TabNavigatorComponent: React.FC<TabNavigatorProps> = ({
  tabs,
  selectedIndex,
  onSelect,
  style,
}) => {
  const { bottom: bottomInset } = useSafeAreaInsets();

  const barY = useSharedValue(80);
  const barOp = useSharedValue(0);

  useEffect(() => {
    barY.value = withTiming(0, { duration: 600, easing: EASE_OUT });
    barOp.value = withTiming(1, { duration: 500 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: barY.value }],
    opacity: barOp.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        barStyle,
        { paddingBottom: Math.max(bottomInset, 24) },
      ]}
    >
      {tabs.map((tab, index) => (
        <NavTab
          key={tab.id}
          tab={tab}
          isActive={selectedIndex === index}
          onPress={() => onSelect(index)}
        />
      ))}
    </Animated.View>
  );
};

export const TabNavigator = React.memo(TabNavigatorComponent);
