import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { Button } from '../../../components/common/Button';
import { CricketProfile } from '../../../types';
import { onboardingService } from '../../../services/onboarding.service';

interface CricketProfileScreenProps {
  initialData?: {
    role: string;
    batting_hand: string;
    batting_position: string;
    bowling_arm: string;
    bowling_style: string;
  };
  onBack: () => void;
  onSave: () => void;
}

const SPRING_IN = { damping: 20, stiffness: 400 } as const;
const SPRING_OUT = { damping: 18, stiffness: 300 } as const;

export const CricketProfileScreen: React.FC<CricketProfileScreenProps> = ({
  initialData,
  onBack,
  onSave: onSaveProp,
}) => {
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(
    initialData?.role || null,
  );

  useEffect(() => {
    if (initialData) {
      setSelectedRole(initialData.role);
    }
    setLoading(false);
  }, [initialData]);

  // Press scale per card (entrance is handled by `entering` prop)
  const cardScale0 = useSharedValue(1);
  const cardScale1 = useSharedValue(1);
  const cardScale2 = useSharedValue(1);

  const cardScaleStyle0 = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale0.value }],
  }));
  const cardScaleStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale1.value }],
  }));
  const cardScaleStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale2.value }],
  }));

  const cardScales = [cardScale0, cardScale1, cardScale2];
  const cardScaleStyles = [cardScaleStyle0, cardScaleStyle1, cardScaleStyle2];

  const handleSave = async () => {
    if (!selectedRole) {
      return;
    }
    try {
      setSaving(true);
      await onboardingService.updateCricketProfile({ role: selectedRole });
      onSaveProp();
    } catch (error) {
      console.error('Failed to update cricket profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const roles = [
    {
      id: 'batsman' as CricketProfile,
      title: 'Batsman',
      subtitle: 'Focus on batting analytics',
    },
    {
      id: 'bowler' as CricketProfile,
      title: 'Bowler',
      subtitle: 'Focus on bowling analytics',
    },
    {
      id: 'all_rounder' as CricketProfile,
      title: 'All-Rounder',
      subtitle: 'Complete batting & bowling analytics',
    },
  ];

  const { headerStyle } = useHeaderAnimation();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neutrals.white} />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={colors.neutrals.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Cricket Profile</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {roles.map((role, index) => {
          const isSelected = selectedRole === role.id;
          const scaleValue = cardScales[index];
          return (
            <Animated.View
              key={role.id}
              entering={FadeInUp.delay(150 + index * 80).duration(350)}
            >
              <Animated.View style={cardScaleStyles[index]}>
                <Pressable
                  onPressIn={() => {
                    scaleValue.value = withSpring(0.97, SPRING_IN);
                  }}
                  onPressOut={() => {
                    scaleValue.value = withSpring(1.0, SPRING_OUT);
                  }}
                  onPress={() => {
                    setSelectedRole(role.id);
                    scaleValue.value = withSequence(
                      withSpring(0.96, SPRING_IN),
                      withSpring(1.0, SPRING_OUT),
                    );
                  }}
                  style={[styles.roleCard, isSelected && styles.roleCardActive]}
                >
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                  </View>
                  <View
                    style={[styles.radio, isSelected && styles.radioActive]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </Pressable>
              </Animated.View>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="SAVE"
          onPress={handleSave}
          variant="primary"
          loading={saving}
          disabled={saving || !selectedRole}
        />
      </View>
    </SafeAreaView>
  );
};
