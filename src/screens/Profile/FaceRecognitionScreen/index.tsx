import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, CameraIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { Button } from '../../../components/common/Button';
import { FaceCaptureModal } from '../../../components/common/FaceCaptureModal';
import { uploadService } from '../../../services/upload.service';

interface FaceRecognitionScreenProps {
  onBack: () => void;
  onSave: () => void;
  initialImages?: {
    left?: string;
    front?: string;
    right?: string;
  };
}

const SPRING_OUT = { damping: 8, stiffness: 300 } as const;
const SPRING_BACK = { damping: 12, stiffness: 300 } as const;

export const FaceRecognitionScreen: React.FC<FaceRecognitionScreenProps> = ({
  onBack,
  onSave,
  initialImages,
}) => {
  const [capturedImages, setCapturedImages] = useState<{
    left?: string;
    front?: string;
    right?: string;
  }>({});
  const [activeCapture, setActiveCapture] = useState<
    'left' | 'front' | 'right' | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);

  // Scale flash for each circle when a photo is captured
  const leftScale = useSharedValue(1);
  const frontScale = useSharedValue(1);
  const rightScale = useSharedValue(1);

  // Fade-in for captured images (initialImages start at full opacity)
  const leftImgOpacity = useSharedValue(initialImages?.left ? 1 : 0);
  const frontImgOpacity = useSharedValue(initialImages?.front ? 1 : 0);
  const rightImgOpacity = useSharedValue(initialImages?.right ? 1 : 0);

  const leftScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
  }));
  const frontScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: frontScale.value }],
  }));
  const rightScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
  }));

  const leftImgStyle = useAnimatedStyle(() => ({
    opacity: leftImgOpacity.value,
  }));
  const frontImgStyle = useAnimatedStyle(() => ({
    opacity: frontImgOpacity.value,
  }));
  const rightImgStyle = useAnimatedStyle(() => ({
    opacity: rightImgOpacity.value,
  }));

  const handleCapture = (photo: { path: string }) => {
    if (!activeCapture) {
      return;
    }

    setCapturedImages(prev => ({ ...prev, [activeCapture]: photo.path }));

    const scaleMap = { left: leftScale, front: frontScale, right: rightScale };
    const opacityMap = {
      left: leftImgOpacity,
      front: frontImgOpacity,
      right: rightImgOpacity,
    };

    scaleMap[activeCapture].value = withSequence(
      withSpring(1.14, SPRING_OUT),
      withSpring(1.0, SPRING_BACK),
    );
    opacityMap[activeCapture].value = withTiming(1, { duration: 280 });
  };

  const handleSave = async () => {
    if (
      !capturedImages.left ||
      !capturedImages.front ||
      !capturedImages.right
    ) {
      Alert.alert('Incomplete', 'Please capture all three face angles.');
      return;
    }

    try {
      setIsSaving(true);
      const { urls } = await uploadService.getFaceUploadUrls({ count: 3 });

      const uploadPromises = [
        uploadService.uploadFileToS3(
          urls[0].url,
          capturedImages.left,
          'image/jpeg',
        ),
        uploadService.uploadFileToS3(
          urls[1].url,
          capturedImages.front,
          'image/jpeg',
        ),
        uploadService.uploadFileToS3(
          urls[2].url,
          capturedImages.right,
          'image/jpeg',
        ),
      ];

      await Promise.all(uploadPromises);
      onSave();
    } catch (error) {
      console.error('Failed to save face images:', error);
      Alert.alert(
        'Error',
        'Failed to save face recognition profile. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const { headerStyle } = useHeaderAnimation();

  const isCaptured = (key: 'left' | 'front' | 'right') =>
    !!(capturedImages[key] || initialImages?.[key]);

  const getImageUri = (key: 'left' | 'front' | 'right') => {
    if (capturedImages[key]) {
      return `file://${capturedImages[key]}`;
    }
    if (initialImages?.[key]) {
      return initialImages[key];
    }
    return null;
  };

  const renderCircle = (
    key: 'left' | 'front' | 'right',
    label: string,
    scaleStyle: ReturnType<typeof useAnimatedStyle>,
    imgStyle: ReturnType<typeof useAnimatedStyle>,
  ) => {
    const uri = getImageUri(key);
    return (
      <Animated.View style={scaleStyle}>
        <TouchableOpacity
          style={styles.captureCircle}
          activeOpacity={0.7}
          onPress={() => setActiveCapture(key)}
        >
          {uri ? (
            <Animated.Image
              source={{ uri }}
              style={[styles.capturedImage, imgStyle as any]}
            />
          ) : (
            <>
              <CameraIcon size={28} color={colors.neutrals[40]} />
              <Text style={styles.captureLabel}>{label}</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={colors.neutrals.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Face Recognition Setup</Text>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          style={styles.instructionCard}
          entering={FadeInUp.delay(160).duration(400)}
        >
          <Text style={styles.instructionText}>
            Tap each circle to capture. Ensure good lighting and a neutral
            background
          </Text>

          <View style={styles.captureRow}>
            {renderCircle('left', 'Left', leftScaleStyle, leftImgStyle)}
            {renderCircle('front', 'Front', frontScaleStyle, frontImgStyle)}
            {renderCircle('right', 'Right', rightScaleStyle, rightImgStyle)}
          </View>
        </Animated.View>
      </View>

      <FaceCaptureModal
        isVisible={activeCapture !== null}
        onClose={() => setActiveCapture(null)}
        onCapture={handleCapture}
        title={`Capture ${activeCapture?.toUpperCase()} Face`}
      />

      <View style={styles.footer}>
        <Button
          label="SAVE"
          onPress={handleSave}
          variant="primary"
          loading={isSaving}
          disabled={
            isSaving ||
            !isCaptured('left') ||
            !isCaptured('front') ||
            !isCaptured('right')
          }
        />
      </View>
    </SafeAreaView>
  );
};
