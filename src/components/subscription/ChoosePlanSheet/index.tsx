import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  CrownIcon,
  UsersThreeIcon,
  CheckCircleIcon,
} from 'phosphor-react-native';
import { BottomSheet } from '../../common/BottomSheet';
import { Button } from '../../common/Button';
import { colors } from '../../../theme/colors';
import { BillingInterval } from '../../../services/plan.service';
import { styles } from './styles';

interface ChoosePlanSheetProps {
  isVisible: boolean;
  selectedRole?: 'player' | 'coach';
  isLoading?: boolean;
  onContinueTrial: () => void;
  onPurchase: (billingInterval: BillingInterval) => void;
  onContactTeam: () => void;
  onClose: () => void;
}

export const ChoosePlanSheet: React.FC<ChoosePlanSheetProps> = ({
  isVisible,
  selectedRole = 'player',
  isLoading = false,
  onContinueTrial,
  onPurchase,
  onContactTeam,
  onClose,
}) => {
  const showCoachPlan = selectedRole === 'coach';

  return (
    <BottomSheet
      isVisible={isVisible}
      title="Choose your plan"
      onClose={onClose}
      closeOnBackdrop={false}
      showCloseButton={false}
    >
      <Text style={styles.subtitle}>
        Start with your 14-day full player trial, or subscribe now.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBubble}>
            <CheckCircleIcon size={20} color={colors.success.main} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>Free Trial</Text>
            <Text style={styles.cardMeta}>14 days of Player Pro access</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>
          Record unlimited sessions and try premium analysis during your trial.
        </Text>
        <Button
          label="Start free trial"
          variant="outline_dark"
          onPress={onContinueTrial}
          disabled={isLoading}
          style={styles.button}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBubble}>
            <CrownIcon size={20} color={colors.primary.main} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>Player Pro</Text>
            <Text style={styles.cardMeta}>Monthly or annual subscription</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>
          Unlock speed, line and length, pitch maps, ball tracking and analytics.
        </Text>
        <View style={styles.buttonRow}>
          <Button
            label="Monthly"
            variant="primary"
            onPress={() => onPurchase('month')}
            loading={isLoading}
            disabled={isLoading}
            style={styles.rowButton}
          />
          <Button
            label="Annual"
            variant="outline_dark"
            onPress={() => onPurchase('year')}
            loading={isLoading}
            disabled={isLoading}
            style={styles.rowButton}
          />
        </View>
      </View>

      {showCoachPlan && (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.82}
          onPress={onContactTeam}
          disabled={isLoading}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconBubble}>
              <UsersThreeIcon size={20} color={colors.neutrals.white} />
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>Coach Mode</Text>
              <Text style={styles.cardMeta}>Academy setup required</Text>
            </View>
          </View>
          <Text style={styles.cardBody}>
            Contact our team to set up your academy, coaches and student kits.
          </Text>
          <Text style={styles.contactText}>Contact team</Text>
        </TouchableOpacity>
      )}
    </BottomSheet>
  );
};
