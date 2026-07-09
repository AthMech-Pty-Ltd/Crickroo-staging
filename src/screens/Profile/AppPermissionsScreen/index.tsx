import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CameraIcon,
  MapPinIcon,
  MicrophoneIcon,
} from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { PermissionItem } from '../../Auth/RegistrationFlow/steps/PermissionItem';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { useAuthContext } from '../../../store/AuthContext';

interface AppPermissionsScreenProps {
  onBack: () => void;
}

export const AppPermissionsScreen: React.FC<AppPermissionsScreenProps> = ({
  onBack,
}) => {
  const { permissions, refreshPermissions } = useAuthContext();
  const [cameraGranted, setCameraGranted] = React.useState(permissions.camera);
  const [locationGranted, setLocationGranted] = React.useState(
    permissions.location,
  );
  const [microphoneGranted, setMicrophoneGranted] = React.useState(
    permissions.microphone,
  );

  const CAMERA_PERMISSION = Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  });

  const LOCATION_PERMISSION = Platform.select({
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  });

  const MICROPHONE_PERMISSION = Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
  });

  React.useEffect(() => {
    const checkInitialPermissions = async () => {
      if (CAMERA_PERMISSION) {
        const cameraStatus = await check(CAMERA_PERMISSION);
        if (cameraStatus === RESULTS.GRANTED) {
          setCameraGranted(true);
        }
      }
      if (LOCATION_PERMISSION) {
        const locationStatus = await check(LOCATION_PERMISSION);
        if (locationStatus === RESULTS.GRANTED) {
          setLocationGranted(true);
        }
      }
      if (MICROPHONE_PERMISSION) {
        const micStatus = await check(MICROPHONE_PERMISSION);
        if (micStatus === RESULTS.GRANTED) {
          setMicrophoneGranted(true);
        }
      }
    };
    checkInitialPermissions();
  }, [CAMERA_PERMISSION, LOCATION_PERMISSION, MICROPHONE_PERMISSION]);

  const handleCameraPress = async () => {
    if (cameraGranted || !CAMERA_PERMISSION) {
      return;
    }
    const status = await request(CAMERA_PERMISSION);
    if (status === RESULTS.GRANTED) {
      setCameraGranted(true);
      refreshPermissions();
    } else if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Please enable camera access in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => openSettings() },
        ],
      );
    }
  };

  const handleLocationPress = async () => {
    if (locationGranted || !LOCATION_PERMISSION) {
      return;
    }
    const status = await request(LOCATION_PERMISSION);
    if (status === RESULTS.GRANTED) {
      setLocationGranted(true);
      refreshPermissions();
    } else if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Please enable location access in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => openSettings() },
        ],
      );
    }
  };

  const handleMicrophonePress = async () => {
    if (microphoneGranted || !MICROPHONE_PERMISSION) {
      return;
    }
    const status = await request(MICROPHONE_PERMISSION);
    if (status === RESULTS.GRANTED) {
      setMicrophoneGranted(true);
      refreshPermissions();
    } else if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Please enable microphone access in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => openSettings() },
        ],
      );
    }
  };

  const { headerStyle } = useHeaderAnimation();
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={colors.neutrals.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Permissions</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(160).duration(380)}>
            <PermissionItem
              icon={<CameraIcon size={24} color={colors.primary.main} />}
              title="Camera Access"
              description="Required for face capture and real-time ball tracking during training"
              buttonLabel="ALLOW CAMERA"
              isGranted={cameraGranted}
              onAllow={handleCameraPress}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(260).duration(380)}>
            <PermissionItem
              icon={<MapPinIcon size={24} color={colors.primary.main} />}
              title="Location Access"
              description="Helps us provide weather-adjusted insights and find nearby training facilities"
              buttonLabel="ALLOW LOCATION"
              isGranted={locationGranted}
              onAllow={handleLocationPress}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(360).duration(380)}>
            <PermissionItem
              icon={<MicrophoneIcon size={24} color={colors.primary.main} />}
              title="Microphone Access"
              description="Required to record audio during training sessions"
              buttonLabel="ALLOW MICROPHONE"
              isGranted={microphoneGranted}
              onAllow={handleMicrophonePress}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
