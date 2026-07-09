import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import {
  CameraIcon,
  MicrophoneIcon,
  CheckCircleIcon,
  XIcon,
} from 'phosphor-react-native';
import { RESULTS, PermissionStatus } from 'react-native-permissions';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface PermissionModalProps {
  isVisible: boolean;
  cameraStatus: PermissionStatus;
  microphoneStatus: PermissionStatus;
  onRequestPermissions: () => void;
  onClose: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isVisible,
  cameraStatus,
  microphoneStatus,
  onRequestPermissions,
  onClose,
}) => {
  const cameraGranted = cameraStatus === RESULTS.GRANTED;
  const micGranted = microphoneStatus === RESULTS.GRANTED;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Permissions Required</Text>
              <Text style={styles.subtitle}>
                Crickroo needs access to record and analyze your sessions
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XIcon size={16} color={colors.neutrals[60]} weight="bold" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <PermissionRow
            icon={
              <CameraIcon
                size={22}
                color={
                  cameraGranted ? colors.success.main : colors.primary.main
                }
                weight="fill"
              />
            }
            name="Camera"
            description="Required to record video during sessions"
            granted={cameraGranted}
          />

          <PermissionRow
            icon={
              <MicrophoneIcon
                size={22}
                color={micGranted ? colors.success.main : colors.primary.main}
                weight="fill"
              />
            }
            name="Microphone"
            description="Required to capture audio with each clip"
            granted={micGranted}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRequestPermissions}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>GRANT PERMISSIONS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsButtonText}>NOT NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface PermissionRowProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  granted: boolean;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  icon,
  name,
  description,
  granted,
}) => (
  <View style={styles.permissionRow}>
    <View style={[styles.iconWrapper, granted && styles.iconWrapperGranted]}>
      {icon}
    </View>
    <View style={styles.permissionText}>
      <Text style={styles.permissionName}>{name}</Text>
      <Text style={styles.permissionDesc}>{description}</Text>
    </View>
    <View style={[styles.statusBadge, granted && styles.statusBadgeGranted]}>
      {granted ? (
        <CheckCircleIcon
          size={14}
          color={colors.success.main}
          weight="regular"
        />
      ) : (
        <Text style={styles.statusText}>Required</Text>
      )}
    </View>
  </View>
);
