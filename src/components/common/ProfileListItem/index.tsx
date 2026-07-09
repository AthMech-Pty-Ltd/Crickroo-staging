import React from 'react';
import {
  Pressable,
  View,
  Text,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { CaretDownIcon } from 'phosphor-react-native';
import { styles } from './styles';
import { colors } from '../../../theme/colors';

interface ProfileListItemProps {
  icon?: ImageSourcePropType | React.ReactNode;
  iconContainerStyle?: StyleProp<ViewStyle>;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
  style?: StyleProp<ViewStyle>;
  hideChevron?: boolean;
  disabled?: boolean;
}

export const ProfileListItem: React.FC<ProfileListItemProps> = ({
  icon,
  iconContainerStyle,
  title,
  subtitle,
  onPress,
  rightElement,
  isDestructive = false,
  style,
  hideChevron = false,
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = [
    styles.container,
    style,
    !subtitle && { alignItems: 'center' as const },
    disabled && { opacity: 0.5 },
  ];

  const innerAlignmentStyle = !subtitle
    ? { alignItems: 'center' as const }
    : null;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 20, stiffness: 400 });
        }}
        style={containerStyle}
        disabled={disabled}
      >
        <View style={[styles.leftContent, innerAlignmentStyle]}>
          {icon && (
            <View style={[styles.iconContainer, iconContainerStyle]}>
              {React.isValidElement(icon) ? (
                icon
              ) : (
                <Image
                  source={icon as ImageSourcePropType}
                  style={[
                    styles.icon,
                    isDestructive && { tintColor: colors.error[50] },
                  ]}
                  resizeMode="contain"
                />
              )}
            </View>
          )}
          <View style={styles.textContainer}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.title, isDestructive && styles.destructiveText]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.rightContent, innerAlignmentStyle]}>
          {rightElement}
          {!hideChevron && (
            <CaretDownIcon
              size={16}
              color={colors.neutrals[40]}
              style={{ transform: [{ rotate: '-90deg' }] }}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};
