import React from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  ViewStyle,
  TouchableOpacity,
  StyleProp,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useDerivedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CopyIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import LockImage from '../../../assets/images/lock.svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Progress-ring palette for the KPI circles. Sourced from theme tokens; the
// purple was added to the theme since it didn't previously exist.
export const STAT_RING_COLORS = {
  purple: '#EB5F10',
  red: '#EB5F10',
  green: '#EB5F10',
  yellow: '#EB5F10',
};

const RING_SIZE = 56;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface StatCircleProps {
  value: string | number;
  label: string;
  progress?: number;
  color?: string;
  onPress?: () => void;
  dimmed?: boolean;
  locked?: boolean;
  onLockedPress?: () => void;
}

export const StatCircle: React.FC<StatCircleProps> = ({
  value,
  label,
  progress = 0,
  onPress,
  dimmed = false,
  locked = false,
  onLockedPress,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const gradientId = React.useMemo(
    () => `statRingGradient-${label.replace(/\W+/g, '-').toLowerCase()}`,
    [label],
  );
  const clamped = locked ? 0 : Math.max(0, Math.min(1, progress));
  const center = RING_SIZE / 2;

  const fill = useDerivedValue(
    () =>
      withTiming(clamped, { duration: 900, easing: Easing.out(Easing.cubic) }),
    [clamped],
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - fill.value),
  }));

  const resolvedPress = locked ? onLockedPress : onPress;
  const Container: React.ComponentType<any> = resolvedPress
    ? TouchableOpacity
    : View;

  return (
    <Container
      style={[styles.statContainer, dimmed && styles.statDimmed]}
      {...(resolvedPress ? { onPress: resolvedPress, activeOpacity: 0.7 } : {})}
    >
      <View style={styles.ring}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Defs>
            <SvgLinearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#F4AC25" />
              <Stop offset="100%" stopColor="#EB5F10" />
            </SvgLinearGradient>
          </Defs>
          <Circle
            cx={center}
            cy={center}
            r={RING_RADIUS}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={RING_STROKE}
            fill="rgba(24, 25, 24, 0.88)"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={RING_RADIUS}
            stroke={`url(#${gradientId})`}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={styles.ringValue}>
          {locked ? (
            <LockImage width={34} height={34} />
          ) : (
            <Text style={styles.valueText}>{value}</Text>
          )}
        </View>
      </View>
      <Text
        numberOfLines={2}
        ellipsizeMode="tail"
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={[styles.labelText, isCompact && styles.labelTextCompact]}
      >
        {label}
      </Text>
    </Container>
  );
};

interface SessionCardProps {
  title: string;
  subtitle: string;
  participants?: string[];
  participantAvatars?: (ImageSourcePropType | React.ReactNode)[];
  onDuplicate?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  title,
  subtitle,
  participants,
  participantAvatars,
  onDuplicate,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.sessionCard, style]}
    >
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{title}</Text>
        <Text style={styles.sessionSubtitle}>{subtitle}</Text>
        {participantAvatars && participantAvatars.length > 0 && (
          <View style={styles.avatarStack}>
            {participantAvatars.map((avatar, index) => (
              <View
                key={index}
                style={[
                  styles.avatarWrapper,
                  index > 0 && styles.stackedAvatar,
                ]}
              >
                {React.isValidElement(avatar) ? (
                  avatar
                ) : (
                  <Image
                    source={avatar as ImageSourcePropType}
                    style={styles.avatar}
                  />
                )}
              </View>
            ))}
            {participants && participants.length > 0 && (
              <Text style={styles.participantsText}>
                {participants.join(', ')}
              </Text>
            )}
          </View>
        )}
      </View>
      {onDuplicate && (
        <TouchableOpacity
          onPress={onDuplicate}
          style={styles.duplicateButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CopyIcon size={18} color={colors.primary.main} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
