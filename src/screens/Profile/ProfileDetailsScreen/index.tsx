import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { styles } from './styles';
import {
  ArrowLeftIcon,
  CameraIcon,
  UserCircleIcon,
} from 'phosphor-react-native';
import { ProfileListItem } from '../../../components/common/ProfileListItem';
import { OnboardingSummaryResponse } from '../../../types/onboarding';
import { colors } from '../../../theme/colors';
import { uploadService } from '../../../services/upload.service';

interface ProfileDetailsScreenProps {
  onBack: () => void;
  onOptionPress: (id: string) => void;
  summary: OnboardingSummaryResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

function calculateCompletion(
  summary: OnboardingSummaryResponse | null,
): number {
  if (!summary) return 0;
  const checks = [
    !!summary.personalProfile?.name,
    !!summary.personalProfile?.dob,
    (summary.personalProfile?.height_cm ?? 0) > 0,
    (summary.personalProfile?.weight_kg ?? 0) > 0,
    !!summary.cricketProfile?.role,
    !!summary.cricketProfile?.batting_hand,
    !!summary.cricketProfile?.bowling_arm,
    !!summary.profileImageUrl,
    !!summary.faceImageFrontview,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const STAGGER_BASE = 200;
const STAGGER_STEP = 60;
const ITEM_DURATION = 350;

const menuItems = [
  { id: 'personal_profile', title: 'Personal Profile' },
  { id: 'app_permissions', title: 'App Permissions' },
  { id: 'face_recognition', title: 'Face Recognition' },
  { id: 'cricket_profile', title: 'Cricket Profile' },
  { id: 'playing_style', title: 'Playing Style' },
] as const;

export const ProfileDetailsScreen: React.FC<ProfileDetailsScreenProps> = ({
  onBack,
  onOptionPress,
  summary,
  isLoading,
  onRefresh,
}) => {
  const userName = summary?.personalProfile?.name;
  const { headerStyle } = useHeaderAnimation();
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const completion = calculateCompletion(summary);
  const [cardDismissed, setCardDismissed] = useState(() => completion === 100);
  const prevCompletionRef = useRef(completion);

  const progressWidth = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withDelay(
      400,
      withTiming(completion, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [completion, progressWidth]);

  useEffect(() => {
    const prev = prevCompletionRef.current;
    prevCompletionRef.current = completion;
    if (completion === 100 && prev < 100 && !cardDismissed) {
      cardOpacity.value = withDelay(1200, withTiming(0, { duration: 500 }));
      const t = setTimeout(() => setCardDismissed(true), 1700);
      return () => clearTimeout(t);
    }
  }, [completion, cardDismissed, cardOpacity]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const handleUploadImage = async (fileUri: string) => {
    try {
      setUploading(true);
      const rawPath = fileUri.replace('file://', '');
      const { url } = await uploadService.getProfileImageUploadUrl();
      await uploadService.uploadFileToS3(url, rawPath, 'image/jpeg');
      onRefresh();
    } catch (error) {
      console.error('Profile image upload failed:', error);
      Alert.alert(
        'Upload Failed',
        'Could not upload profile image. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCamera = async () => {
    setShowPicker(false);
    setTimeout(async () => {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });
      if (result.errorCode === 'permission') {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in your device Settings to take a photo.',
          [{ text: 'OK' }],
        );
        return;
      }
      if (result.assets?.[0]?.uri) {
        handleUploadImage(result.assets[0].uri);
      }
    }, 400);
  };

  const handleGallery = async () => {
    setShowPicker(false);
    setTimeout(async () => {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });
      if (result.assets?.[0]?.uri) {
        handleUploadImage(result.assets[0].uri);
      }
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          disabled={isLoading}
        >
          <ArrowLeftIcon size={24} color={colors.neutrals.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Animated.View
            style={styles.avatarContainer}
            entering={FadeIn.delay(100).duration(500)}
          >
            {summary?.profileImageUrl ? (
              <Image
                source={{ uri: summary.profileImageUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <UserCircleIcon size={160} color={colors.neutrals[40]} />
            )}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={colors.neutrals.white} />
              </View>
            )}
            <TouchableOpacity
              style={styles.editIconContainer}
              disabled={isLoading || uploading}
              onPress={() => setShowPicker(true)}
            >
              <CameraIcon size={24} color={colors.neutrals.white} />
            </TouchableOpacity>
          </Animated.View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.neutrals.white} />
            </View>
          ) : (
            <Text style={styles.userName}>{userName || 'User'}</Text>
          )}
        </View>

        {!cardDismissed && (
          <Animated.View
            entering={FadeInUp.delay(160).duration(380)}
            exiting={FadeOut.duration(300)}
          >
            <Animated.View style={[styles.completionCard, cardAnimStyle]}>
              <View style={styles.completionRow}>
                <Text style={styles.completionLabel}>
                  Complete Your Profile
                </Text>
                <Text style={styles.completionPercent}>{completion}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[styles.progressFill, progressBarStyle]}
                />
              </View>
            </Animated.View>
          </Animated.View>
        )}

        <View style={styles.menuGroup}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(
                STAGGER_BASE + STAGGER_STEP * index,
              ).duration(ITEM_DURATION)}
            >
              <ProfileListItem
                title={item.title}
                onPress={() => onOptionPress(item.id)}
                style={styles.menuItem}
                disabled={isLoading}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.actionSheet}>
            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={handleCamera}
            >
              <Text style={styles.actionSheetOptionText}>Camera</Text>
            </TouchableOpacity>
            <View style={styles.actionSheetDivider} />
            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={handleGallery}
            >
              <Text style={styles.actionSheetOptionText}>
                Upload from Gallery
              </Text>
            </TouchableOpacity>
            <View style={styles.actionSheetDivider} />
            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
