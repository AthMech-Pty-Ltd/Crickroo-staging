import React from 'react';
import { View, ScrollView, Platform, Alert } from 'react-native';
import { CameraIcon, MapPinIcon, MicrophoneIcon } from 'phosphor-react-native';
import { Button } from '../../../../../components/common/Button';
import { BaseAuthLayout } from '../../../../../components/auth/BaseAuthLayout';
import { PermissionItem } from '../PermissionItem';
import { colors } from '../../../../../theme/colors';
import { styles } from './styles';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { useAuthContext } from '../../../../../store/AuthContext';

interface Step3PermissionsProps {
  onAllowCamera: () => void;
  onAllowLocation: () => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  stepDisplay?: number;
  isExiting?: boolean;
}

export const Step3Permissions: React.FC<Step3PermissionsProps> = ({
  onAllowCamera,
  onAllowLocation,
  onNext,
  onBack,
  isLoading,
  stepDisplay,
  isExiting,
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

  const handleAllowCamera = async () => {
    if (!CAMERA_PERMISSION) return;
    const status = await request(CAMERA_PERMISSION);
    if (status === RESULTS.GRANTED) {
      setCameraGranted(true);
      refreshPermissions();
      onAllowCamera();
    } else if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Please enable camera access in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    }
  };

  const handleAllowLocation = async () => {
    if (!LOCATION_PERMISSION) return;
    const status = await request(LOCATION_PERMISSION);
    if (status === RESULTS.GRANTED) {
      setLocationGranted(true);
      refreshPermissions();
      onAllowLocation();
    } else if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Please enable location access in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    }
  };

  const handleAllowMicrophone = async () => {
    if (!MICROPHONE_PERMISSION) return;
    const status = await request(MICROPHONE_PERMISSION);
    if (status === RESULTS.GRANTED) {
      setMicrophoneGranted(true);
      refreshPermissions();
    } else if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Please enable microphone access in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    }
  };

  return (
    <BaseAuthLayout
      title="App Permissions"
      subtitle="Grant access for the best experience"
      onBack={onBack}
      currentStep={stepDisplay ?? 2}
      totalSteps={2}
      isExiting={isExiting}
      hasFooterBackground={true}
      footer={
        <Button
          label="CONTINUE"
          onPress={onNext}
          variant="primary"
          loading={isLoading}
          disabled={
            isLoading ||
            !cameraGranted ||
            !locationGranted ||
            !microphoneGranted
          }
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <PermissionItem
            icon={<CameraIcon size={24} color={colors.primary.main} />}
            title="Camera Access"
            description="Required for video recording and real-time ball tracking during training"
            buttonLabel="ALLOW CAMERA"
            isGranted={cameraGranted}
            onAllow={handleAllowCamera}
          />

          <PermissionItem
            icon={<MapPinIcon size={24} color={colors.primary.main} />}
            title="Location Access"
            description="Helps us provide weather-adjusted insights and find nearby training facilities"
            buttonLabel="ALLOW LOCATION"
            isGranted={locationGranted}
            onAllow={handleAllowLocation}
          />

          <PermissionItem
            icon={<MicrophoneIcon size={24} color={colors.primary.main} />}
            title="Microphone Access"
            description="Required to record audio during training sessions"
            buttonLabel="ALLOW MICROPHONE"
            isGranted={microphoneGranted}
            onAllow={handleAllowMicrophone}
          />
        </View>
      </ScrollView>
    </BaseAuthLayout>
  );
};
