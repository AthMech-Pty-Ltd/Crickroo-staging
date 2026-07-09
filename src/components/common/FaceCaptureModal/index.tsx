import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Camera, useCameraDevice, PhotoFile } from 'react-native-vision-camera';
import { styles } from './styles';
import { colors } from '../../../theme/colors';

interface FaceCaptureModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCapture: (photo: PhotoFile) => void;
  title: string;
}

export const FaceCaptureModal: React.FC<FaceCaptureModalProps> = ({
  isVisible,
  onClose,
  onCapture,
  title,
}) => {
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const takePhoto = async () => {
    if (!camera.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await camera.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });
      onCapture(photo);
      onClose();
    } catch (error) {
      console.error('Failed to take photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!device) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isVisible}
          photo={true}
        />

        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.guideContainer}>
            <View style={styles.faceGuide} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePhoto}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color={colors.neutrals.white} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
