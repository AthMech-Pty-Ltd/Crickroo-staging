import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { CameraIcon } from 'phosphor-react-native';
import { colors } from '../../../../../theme/colors';
import { Button } from '../../../../../components/common/Button';
import { BaseAuthLayout } from '../../../../../components/auth/BaseAuthLayout';
import { FaceCaptureModal } from '../../../../../components/common/FaceCaptureModal';
import { uploadService } from '../../../../../services/upload.service';
import { onboardingService } from '../../../../../services/onboarding.service';
import { styles } from './styles';

interface Step2FaceIDProps {
  onNext: () => void;
  onBack: () => void;
  stepDisplay?: number;
  isExiting?: boolean;
}

export const Step2FaceID: React.FC<Step2FaceIDProps> = ({
  onNext,
  onBack,
  stepDisplay,
  isExiting,
}) => {
  const [capturedImages, setCapturedImages] = useState<{
    left?: string;
    front?: string;
    right?: string;
  }>({});
  const [activeCapture, setActiveCapture] = useState<
    'left' | 'front' | 'right' | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCapture = (photo: { path: string }) => {
    if (activeCapture) {
      setCapturedImages(prev => ({
        ...prev,
        [activeCapture]: photo.path,
      }));
    }
  };

  const handleCompleteSetup = async () => {
    if (
      !capturedImages.left ||
      !capturedImages.front ||
      !capturedImages.right
    ) {
      Alert.alert('Incomplete', 'Please capture all three face angles.');
      return;
    }

    try {
      setIsUploading(true);

      const { urls } = await uploadService.getFaceUploadUrls({ count: 3 });

      await Promise.all([
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
      ]);

      await onboardingService.completeOnboarding();

      onNext();
    } catch (error) {
      console.error('Failed to complete setup:', error);
      Alert.alert(
        'Setup Failed',
        'There was an error completing your setup. Please try again.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <BaseAuthLayout
      title="Face Recognition Setup"
      subtitle="Capture 3 photos of you face for automatic player identification in videos"
      onBack={onBack}
      currentStep={stepDisplay ?? 3}
      totalSteps={3}
      isExiting={isExiting}
      hasFooterBackground={true}
      footer={
        <Button
          label="COMPLETE SETUP"
          onPress={handleCompleteSetup}
          variant="primary"
          loading={isUploading}
          disabled={
            isUploading ||
            !capturedImages.left ||
            !capturedImages.front ||
            !capturedImages.right
          }
        />
      }
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.instructionText}>
            Tap each circle to capture. Ensure good lighting and a neutral
            background
          </Text>

          <View style={styles.photoRow}>
            <TouchableOpacity
              style={styles.photoCircle}
              activeOpacity={0.7}
              onPress={() => setActiveCapture('left')}
            >
              {capturedImages.left ? (
                <Image
                  source={{ uri: `file://${capturedImages.left}` }}
                  style={styles.capturedImage}
                />
              ) : (
                <>
                  <CameraIcon size={32} color={colors.neutrals[40]} />
                  <Text style={styles.photoLabel}>Left</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoCircle}
              activeOpacity={0.7}
              onPress={() => setActiveCapture('front')}
            >
              {capturedImages.front ? (
                <Image
                  source={{ uri: `file://${capturedImages.front}` }}
                  style={styles.capturedImage}
                />
              ) : (
                <>
                  <CameraIcon size={32} color={colors.neutrals[40]} />
                  <Text style={styles.photoLabel}>Front</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoCircle}
              activeOpacity={0.7}
              onPress={() => setActiveCapture('right')}
            >
              {capturedImages.right ? (
                <Image
                  source={{ uri: `file://${capturedImages.right}` }}
                  style={styles.capturedImage}
                />
              ) : (
                <>
                  <CameraIcon size={32} color={colors.neutrals[40]} />
                  <Text style={styles.photoLabel}>Right</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <FaceCaptureModal
          isVisible={activeCapture !== null}
          onClose={() => setActiveCapture(null)}
          onCapture={handleCapture}
          title={`Capture ${activeCapture?.toUpperCase()} Face`}
        />
      </ScrollView>
    </BaseAuthLayout>
  );
};
