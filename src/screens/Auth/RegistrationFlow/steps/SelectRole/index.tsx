import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CoachIcon from '../../../../../assets/images/coach.svg';
import { IdentificationBadgeIcon } from 'phosphor-react-native';
import { Button } from '../../../../../components/common/Button';
import { BaseAuthLayout } from '../../../../../components/auth/BaseAuthLayout';
import { UserRole } from '../../../../../types';
import { colors } from '../../../../../theme/colors';
import { styles } from './styles';

interface SelectRoleProps {
  role: UserRole;
  onUpdateRole: (role: 'player' | 'coach') => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  buttonLabel?: string;
  currentStep?: number;
  totalSteps?: number;
}

export const SelectRole: React.FC<SelectRoleProps> = ({
  role,
  onUpdateRole,
  onNext,
  onBack,
  isLoading = false,
  buttonLabel = 'CONTINUE',
  currentStep,
  totalSteps,
}) => {
  return (
    <BaseAuthLayout
      title="Select Role"
      subtitle="How will you be using the app?"
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      hasFooterBackground={true}
      footer={
        <Button
          label={buttonLabel}
          onPress={onNext}
          variant="primary"
          loading={isLoading}
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.selectionList}>
          <TouchableOpacity
            style={[styles.roleCard, role === 'player' && styles.selectedCard]}
            onPress={() => onUpdateRole('player')}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.roleIcon}>
                <IdentificationBadgeIcon
                  size={24}
                  color={colors.neutrals.white}
                />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>Player</Text>
                <Text style={styles.roleDesc}>
                  Track your batting and bowling analytics, record training
                  sessions and improve your game
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  role === 'player' && styles.radioSelected,
                ]}
              >
                {role === 'player' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, role === 'coach' && styles.selectedCard]}
            onPress={() => onUpdateRole('coach')}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.roleIcon}>
                <CoachIcon width={24} height={24} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>Coach / Academy</Text>
                <Text style={styles.roleDesc}>
                  Manage your players, view their analytics, organise batches
                  and access all training videos
                </Text>
              </View>
              <View
                style={[styles.radio, role === 'coach' && styles.radioSelected]}
              >
                {role === 'coach' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseAuthLayout>
  );
};
