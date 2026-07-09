import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { styles } from './styles';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { Input } from '../../../components/common/Input';
import { colors } from '../../../theme/colors';

interface AcademyDetailsScreenProps {
  initialData?: {
    coach_license_code: string;
    academy_name: string;
  };
  onBack: () => void;
}

export const AcademyDetailsScreen: React.FC<AcademyDetailsScreenProps> = ({
  initialData,
  onBack,
}) => {
  const [loading, setLoading] = useState(!initialData);
  const [academyName, setAcademyName] = useState(
    initialData?.academy_name || '',
  );
  const [licenseCode, setLicenseCode] = useState(
    initialData?.coach_license_code || '',
  );

  useEffect(() => {
    if (initialData) {
      setAcademyName(initialData.academy_name || '');
      setLicenseCode(initialData.coach_license_code || '');
    }
    setLoading(false);
  }, [initialData]);

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
    <Animated.View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.neutrals.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Academy Details</Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={styles.card}
            entering={FadeInUp.delay(160).duration(400)}
          >
            <Input
              label="Academy / Club Name"
              placeholder="KCA"
              value={academyName}
              onChangeText={() => {}}
              editable={false}
            />
            <Input
              label="Academy License Code"
              placeholder="ACA D- XXXX - XXXX"
              value={licenseCode}
              onChangeText={() => {}}
              editable={false}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};
