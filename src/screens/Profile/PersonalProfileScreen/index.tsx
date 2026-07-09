import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import Animated, { useAnimatedStyle, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { useKeyboard } from '../../../hooks/useKeyboard';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { DatePicker } from '../../../components/common/DatePicker';
import { onboardingService } from '../../../services/onboarding.service';
import { storage } from '../../../utils/storage';
import { cmToFtIn, ftInToCm } from '../../../utils/unitConversion';

interface PersonalProfileScreenProps {
  initialData?: {
    name: string;
    dob: string; // YYYY-MM-DD
    height_cm: number;
    weight_kg: number;
  };
  onBack: () => void;
  onSave: () => void;
}

export const PersonalProfileScreen: React.FC<PersonalProfileScreenProps> = ({
  initialData,
  onBack,
  onSave: onSaveProp,
}) => {
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [dob, setDob] = useState(initialData?.dob || '');
  const [unit, setUnit] = useState<'ft/in' | 'cm'>('ft/in');
  const [height, setHeight] = useState(() => {
    if (initialData?.height_cm != null && initialData.height_cm > 0) {
      const { ft, in: inches } = cmToFtIn(initialData.height_cm);
      return ft || inches ? `${ft}-${inches}` : '';
    }
    return '';
  });
  const [weight, setWeight] = useState(
    initialData?.weight_kg != null ? initialData.weight_kg.toString() : '',
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setDob(initialData.dob || '');
      setWeight(
        initialData.weight_kg != null ? initialData.weight_kg.toString() : '',
      );
    }
    setLoading(false);
  }, [initialData]);

  const handleToggleUnit = (newUnit: 'cm' | 'ft/in') => {
    if (unit === newUnit) return;
    Keyboard.dismiss();

    if (height) {
      if (newUnit === 'ft/in') {
        const cm = parseFloat(height) || 0;
        const { ft, in: inches } = cmToFtIn(cm);
        setHeight(ft || inches ? `${ft}-${inches}` : '');
      } else {
        const cm = ftInToCm(height);
        setHeight(cm ? cm.toFixed(2) : '');
      }
    }

    setUnit(newUnit);
  };

  const handleHeightChange = (val: string) => {
    const regex = /^\d*\.?\d{0,2}$/;
    if (val === '' || regex.test(val)) {
      setHeight(val);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const heightInCm =
        unit === 'ft/in' ? ftInToCm(height) : parseFloat(height) || 0;

      const updatedUser = await onboardingService.updatePersonalProfile({
        name,
        dob,
        height_cm: heightInCm,
        weight_kg: parseFloat(weight) || 0,
      });

      const currentUser = await storage.getUser();
      if (currentUser) {
        await storage.saveUser({
          ...currentUser,
          name: updatedUser.name,
          username: updatedUser.username,
          onboarding_completed: updatedUser.onboarding_completed,
          onboarding_step: updatedUser.onboarding_step,
        });
      }

      onSaveProp();
    } catch (error) {
      console.error('Failed to update personal profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const { headerStyle } = useHeaderAnimation();

  const keyboardHeight = useKeyboard();
  const keyboardAnimStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  const isValid = !!name.trim() && !!dob && !!height.trim() && !!weight.trim();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[styles.container, keyboardAnimStyle]}>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.neutrals.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Profile</Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={styles.formCard}
            entering={FadeInUp.delay(160).duration(400)}
          >
            <Input
              label="Name"
              placeholder="Enter Name"
              value={name}
              onChangeText={setName}
            />
            <DatePicker label="Date of Birth" value={dob} onChange={setDob} />

            <View style={styles.heightContainer}>
              <View style={styles.heightHeader}>
                <Text style={styles.heightLabel}>Height</Text>
                <View style={styles.unitSwitcher}>
                  <TouchableOpacity
                    onPress={() => handleToggleUnit('ft/in')}
                    style={[
                      styles.unitOption,
                      unit === 'ft/in' && styles.unitButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === 'ft/in' && styles.unitTextActive,
                      ]}
                    >
                      ft/in
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleToggleUnit('cm')}
                    style={[
                      styles.unitOption,
                      unit === 'cm' && styles.unitButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === 'cm' && styles.unitTextActive,
                      ]}
                    >
                      Cm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {unit === 'ft/in' ? (
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Input
                      label="Height (ft)"
                      placeholder="feet"
                      value={height?.split('-')[0] || ''}
                      onChangeText={val => {
                        const regex = /^\d*$/;
                        if (val === '' || regex.test(val)) {
                          const currentIn = height?.includes('-')
                            ? height.split('-')[1]
                            : '';
                          setHeight(`${val}-${currentIn}`);
                        }
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Input
                      label="Height (in)"
                      placeholder="inch"
                      value={height?.includes('-') ? height.split('-')[1] : ''}
                      onChangeText={val => {
                        const regex = /^\d*$/;
                        if (val === '' || regex.test(val)) {
                          const currentFt = height?.split('-')[0] || '';
                          setHeight(`${currentFt}-${val}`);
                        }
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ) : (
                <Input
                  label="Height (cm)"
                  placeholder="cm"
                  value={height}
                  onChangeText={handleHeightChange}
                  keyboardType="numeric"
                />
              )}
            </View>

            <Input
              label="Weight (kg)"
              placeholder="Enter weight"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="SAVE"
            onPress={handleSave}
            variant="primary"
            loading={saving}
            disabled={saving || !isValid}
          />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};
